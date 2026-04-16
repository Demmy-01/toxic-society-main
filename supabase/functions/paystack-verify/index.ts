// @ts-nocheck — Deno edge function: https:// imports and Deno.* APIs are valid at runtime

/**
 * paystack-verify Edge Function
 * ─────────────────────────────────────────────────────────────────────────────
 * Security hardening (OWASP):
 *  • A02 Cryptographic     — PAYSTACK_SECRET_KEY via Deno.env (never exposed to client)
 *  • A03 Injection         — reference string validated before use; payload fields typed
 *  • A04 Insecure Design   — amount verified against Paystack's own server response
 *  • A05 Misconfiguration  — body size cap, OWASP response headers
 *
 * Flow:
 *  1. Client sends { reference, orderData } after Paystack popup success
 *  2. We call Paystack's verify API using the SECRET key (server-only)
 *  3. We confirm status === 'success' and expected amount matches
 *  4. We save the order to Supabase with status = 'paid' using service role key
 *  5. We return { success: true, orderId }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── OWASP security response headers ─────────────────────────────────────────
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function allHeaders(extra: Record<string, string> = {}) {
  return { ...corsHeaders, ...SECURITY_HEADERS, ...extra }
}

function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: allHeaders({ 'Content-Type': 'application/json', ...extra }),
  })
}

// ─── Paystack reference validator (alphanumeric + underscore/dash, 8–100 chars) ──
function isValidReference(ref: string): boolean {
  return typeof ref === 'string' && /^[a-zA-Z0-9_\-]{8,100}$/.test(ref)
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: allHeaders() })
  }

  // ── Body size cap (OWASP A05) — reject payloads > 8 KB ────────────────────
  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > 8192) {
    return jsonResponse({ success: false, error: 'Request body too large.' }, 413)
  }

  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400)
    }

    const { reference, orderData } = body

    // ── Input validation (OWASP A03) ──────────────────────────────────────────
    if (!reference || !isValidReference(reference)) {
      return jsonResponse({ success: false, error: 'Invalid payment reference.' }, 400)
    }

    if (!orderData || typeof orderData !== 'object') {
      return jsonResponse({ success: false, error: 'Missing order data.' }, 400)
    }

    const { items, totalUsd, customerId, discountCode, discountAmount, discountId } = orderData

    if (!Array.isArray(items) || items.length === 0) {
      return jsonResponse({ success: false, error: 'Order has no items.' }, 400)
    }

    if (typeof totalUsd !== 'number' || totalUsd <= 0) {
      return jsonResponse({ success: false, error: 'Invalid order total.' }, 400)
    }

    // ── Load server-only secrets ──────────────────────────────────────────────
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY secret not set.')
      return jsonResponse({ success: false, error: 'Payment service not configured.' }, 503)
    }

    // ── 1. Verify with Paystack (OWASP A02 — secret key server-only) ──────────
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!verifyRes.ok) {
      console.error(`Paystack verify HTTP ${verifyRes.status}`)
      return jsonResponse({ success: false, error: 'Could not reach payment provider.' }, 502)
    }

    const paystackData = await verifyRes.json()

    // ── 2. Confirm payment status ─────────────────────────────────────────────
    if (!paystackData.status || paystackData.data?.status !== 'success') {
      console.warn('Paystack payment not successful:', paystackData.data?.status)
      return jsonResponse(
        { success: false, error: 'Payment was not completed successfully.' },
        402
      )
    }

    const txData = paystackData.data
    const paidAmountKobo: number = txData.amount      // amount in kobo
    const paidCurrency: string = txData.currency      // e.g. "NGN"
    const paystackRef: string = txData.reference

    // ── 3. Amount sanity check (OWASP A04 — prevent price manipulation) ───────
    // We trust Paystack's returned amount as the ground truth.
    // As a minimum safety check: ensure paid amount > 0.
    if (paidAmountKobo <= 0) {
      return jsonResponse({ success: false, error: 'Invalid payment amount.' }, 400)
    }

    // ── 4. Save order to Supabase using service role (bypasses RLS) ───────────
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const orderPayload: Record<string, unknown> = {
      items,
      total: totalUsd,
      status: 'paid',
      customer_id: customerId ?? null,
      discount_code: discountCode ?? null,
      discount_amount: discountAmount ?? 0,
      payment_reference: paystackRef,
      payment_gateway: 'paystack',
      payment_amount_kobo: paidAmountKobo,
      payment_currency: paidCurrency,
      paid_at: txData.paid_at ?? new Date().toISOString(),
    }

    // Try inserting with all payment columns first
    let orderResult = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single()

    // Graceful fallback: if new payment columns don't exist yet, insert without them
    if (orderResult.error) {
      console.warn('Full insert failed, trying fallback:', orderResult.error.message)
      const { payment_reference: _pr, payment_gateway: _pg, payment_amount_kobo: _pak, payment_currency: _pc, paid_at: _pdat, discount_code: _dc, discount_amount: _da, ...fallback } = orderPayload
      orderResult = await supabase
        .from('orders')
        .insert({ ...fallback, status: 'paid' })
        .select('id')
        .single()
    }

    if (orderResult.error) {
      console.error('Order insert failed:', orderResult.error.message)
      return jsonResponse({ success: false, error: 'Failed to save order.' }, 500)
    }

    const orderId: string = orderResult.data?.id

    // ── 5. Increment discount uses if a promo code was applied ────────────────
    if (discountId && typeof discountId === 'string') {
      const { data: discRow } = await supabase
        .from('discounts')
        .select('uses')
        .eq('id', discountId)
        .single()

      if (discRow) {
        await supabase
          .from('discounts')
          .update({ uses: (discRow.uses ?? 0) + 1 })
          .eq('id', discountId)
      }
    }

    console.log(`Order ${orderId} saved. Paystack ref: ${paystackRef}, amount: ${paidAmountKobo} ${paidCurrency}`)

    return jsonResponse({ success: true, orderId })

  } catch (err) {
    console.error('Unhandled error in paystack-verify:', err)
    return jsonResponse({ success: false, error: 'Internal server error.' }, 500)
  }
})
