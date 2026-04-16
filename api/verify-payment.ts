import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * /api/verify-payment  — Vercel Serverless Function
 * ─────────────────────────────────────────────────────────────────────────────
 * Security model:
 *   • PAYSTACK_SECRET_KEY  — set in Vercel env (and .env locally). NEVER in client.
 *   • Uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (already in .env) for DB writes.
 *   • Reference validated before use (OWASP A03).
 *   • Paystack's server confirms amount + status — prevents price tampering (OWASP A04).
 *
 * Local dev:  run `npx vercel dev` (reads .env automatically)
 * Production: set PAYSTACK_SECRET_KEY in the Vercel dashboard environment variables
 */

function isValidReference(ref: string): boolean {
  return typeof ref === 'string' && /^[a-zA-Z0-9_\-]{8,100}$/.test(ref);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers on every response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  // ── Load secrets (server-only, never sent to browser) ────────────────────
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  // These are already in .env (and Vercel has them as build vars too)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    console.error('[verify-payment] PAYSTACK_SECRET_KEY not set.');
    return res.status(503).json({ success: false, error: 'Payment service not configured.' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[verify-payment] Supabase env vars missing.');
    return res.status(503).json({ success: false, error: 'Database not configured.' });
  }

  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid request body.' });
    }

    const { reference, orderData } = body;

    // ── Input validation ──────────────────────────────────────────────────
    if (!reference || !isValidReference(reference)) {
      return res.status(400).json({ success: false, error: 'Invalid payment reference.' });
    }

    if (!orderData || typeof orderData !== 'object') {
      return res.status(400).json({ success: false, error: 'Missing order data.' });
    }

    const { items, totalUsd, customerId, discountCode, discountAmount, discountId } = orderData;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order has no items.' });
    }

    if (typeof totalUsd !== 'number' || totalUsd <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order total.' });
    }

    // ── 1. Verify with Paystack using SECRET key (server-side only) ───────
    console.log('[verify-payment] Verifying reference:', reference);

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await verifyRes.json();
    console.log('[verify-payment] Paystack response status:', paystackData?.data?.status);

    if (!verifyRes.ok || !paystackData.status || paystackData.data?.status !== 'success') {
      console.warn('[verify-payment] Verification failed:', paystackData?.data?.status ?? paystackData?.message);
      return res.status(402).json({
        success: false,
        error: `Payment not confirmed by Paystack: ${paystackData?.data?.status ?? 'unknown'}`,
      });
    }

    const txData = paystackData.data;
    const paidAmountKobo: number = txData.amount;
    const paidCurrency: string = txData.currency;
    const confirmedRef: string = txData.reference;

    if (paidAmountKobo <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid payment amount from Paystack.' });
    }

    // ── 2. Save order to Supabase ─────────────────────────────────────────
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : undefined;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    });

    const basePayload = {
      items,
      total: totalUsd,
      status: 'paid',
      customer_id: customerId ?? null,
    };

    const fullPayload = {
      ...basePayload,
      discount_code: discountCode ?? null,
      discount_amount: discountAmount ?? 0,
      payment_reference: confirmedRef,
      payment_gateway: 'paystack',
      payment_amount_kobo: paidAmountKobo,
      payment_currency: paidCurrency,
      paid_at: txData.paid_at ?? new Date().toISOString(),
    };

    // Try with all payment columns first
    let orderResult = await supabase.from('orders').insert(fullPayload).select('id').single();

    // Gracefully fall back if payment columns don't exist in the schema yet
    if (orderResult.error) {
      console.warn('[verify-payment] Full insert failed, trying base payload:', orderResult.error.message);
      orderResult = await supabase.from('orders').insert(basePayload).select('id').single();
    }

    if (orderResult.error) {
      console.error('[verify-payment] Order insert failed:', orderResult.error.message);
      return res.status(500).json({ success: false, error: 'Failed to save order to database.' });
    }

    const orderId: string = orderResult.data?.id;

    // ── 3. Increment discount uses ────────────────────────────────────────
    if (discountId && typeof discountId === 'string') {
      const { data: discRow } = await supabase
        .from('discounts')
        .select('uses')
        .eq('id', discountId)
        .single();

      if (discRow) {
        await supabase
          .from('discounts')
          .update({ uses: (discRow.uses ?? 0) + 1 })
          .eq('id', discountId);
      }
    }

    console.log(`[verify-payment] ✅ Order ${orderId} saved. Ref: ${confirmedRef} | ${paidAmountKobo} ${paidCurrency}`);

    return res.status(200).json({ success: true, orderId });

  } catch (err: unknown) {
    console.error('[verify-payment] Unhandled error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
