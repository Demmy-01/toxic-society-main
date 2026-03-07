// @ts-nocheck — Deno edge function: https:// imports and Deno.* APIs are valid at runtime

/**
 * send-campaign Edge Function
 * ─────────────────────────────────────────────────────────────────────────────
 * Security hardening (OWASP):
 *  • A04 Insecure Design   — per-IP rate limiting (5 req / 10 min), 429 + Retry-After
 *  • A03 Injection         — UUID validation for campaign_id before any DB query
 *  • A05 Misconfiguration  — body size cap (1 KB), OWASP security response headers
 *  • A02 Cryptographic     — all sensitive keys via Deno.env (never hard-coded)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── OWASP security headers added to every response ─────────────────────────
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'none'",
    'Cache-Control': 'no-store',
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const allHeaders = (extra: Record<string, string> = {}) => ({
    ...corsHeaders,
    ...SECURITY_HEADERS,
    ...extra,
})

// ─── In-memory IP rate limiter ───────────────────────────────────────────────
// Allows MAX_REQUESTS per IP within WINDOW_MS. Resets after window expires.
// NOTE: This resets on cold start; for persistent limits use a KV store.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5           // max campaign sends per IP per window

interface RateLimitEntry { count: number; windowStart: number }
const rateLimitMap = new Map<string, RateLimitEntry>()

/**
 * Returns { allowed, retryAfterSecs }.
 * Increments the counter for the given key and resets if window has expired.
 */
function checkRateLimit(key: string): { allowed: boolean; retryAfterSecs: number } {
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        // New window
        rateLimitMap.set(key, { count: 1, windowStart: now })
        return { allowed: true, retryAfterSecs: 0 }
    }

    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        const retryAfterSecs = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000)
        return { allowed: false, retryAfterSecs }
    }

    entry.count++
    return { allowed: true, retryAfterSecs: 0 }
}

// ─── UUID v4 validator ───────────────────────────────────────────────────────
// Prevents injection via campaign_id before it touches the DB (OWASP A03)
function isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

// ─── Response helpers ────────────────────────────────────────────────────────
function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: allHeaders({ 'Content-Type': 'application/json', ...extra }),
    })
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: allHeaders() })
    }

    // ── 1. Body size cap (OWASP A05) — reject payloads > 1 KB ──────────────────
    const contentLength = Number(req.headers.get('content-length') ?? 0)
    if (contentLength > 1024) {
        return jsonResponse({ success: false, error: 'Request body too large.' }, 413)
    }

    // ── 2. IP-based rate limiting (OWASP A04) ──────────────────────────────────
    const clientIP =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'

    const { allowed, retryAfterSecs } = checkRateLimit(clientIP)

    if (!allowed) {
        console.warn(`Rate limit exceeded for IP: ${clientIP}`)
        return jsonResponse(
            { success: false, error: 'Too many requests. Please try again later.' },
            429,
            { 'Retry-After': String(retryAfterSecs) }
        )
    }

    try {
        const body = await req.json().catch(() => null)

        if (!body || typeof body !== 'object') {
            return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400)
        }

        const { campaign_id } = body

        // ── 3. Input validation — UUID format (OWASP A03) ─────────────────────────
        if (!campaign_id || typeof campaign_id !== 'string' || !isValidUUID(campaign_id)) {
            return jsonResponse({ success: false, error: 'Invalid campaign_id.' }, 400)
        }

        // ── 4. Supabase client (service role — never exposed to client) ────────────
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const resendApiKey = Deno.env.get('RESEND_API_KEY')!

        // OWASP A02: From address via env var — falls back to verified domain default
        const fromAddress =
            Deno.env.get('RESEND_FROM_EMAIL') ??
            'Toxic Society <noreply@christianevangelismministry.org.uk>'

        if (!resendApiKey) {
            console.error('RESEND_API_KEY secret not set.')
            return jsonResponse({ success: false, error: 'Email service not configured.' }, 503)
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // ── 5. Fetch campaign ─────────────────────────────────────────────────────
        interface CustomerRow { email: string | null; user_id: string | null }
        interface AuthUser { id: string; email?: string }

        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaign_id)
            .single()

        if (campaignError || !campaign) {
            return jsonResponse(
                { success: false, error: `Campaign not found: ${campaignError?.message}` },
                404
            )
        }

        // Mark as sending
        await supabase.from('campaigns').update({ status: 'sending' }).eq('id', campaign_id)

        // ── 6. Collect recipient emails ───────────────────────────────────────────
        let emails: string[] = []

        if (campaign.audience === 'all' || campaign.audience === 'customers') {
            const { data: customers, error: custErr } = await supabase
                .from('customers')
                .select('email, user_id')

            console.log(`Customers query: ${customers?.length ?? 0} rows, error: ${custErr?.message ?? 'none'}`)

            const directEmails = (customers ?? [])
                .map((c: CustomerRow) => c.email)
                .filter((e: string | null): e is string => !!e)

            emails.push(...directEmails)

            // Fallback: customers with no email → look up auth.users
            const nullCustomerIds = (customers ?? [])
                .filter((c: CustomerRow) => !c.email && c.user_id)
                .map((c: CustomerRow) => c.user_id as string)

            if (nullCustomerIds.length > 0) {
                const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
                console.log(`Auth users: ${users?.length ?? 0}, error: ${authErr?.message ?? 'none'}`)
                const authEmails = (users ?? [])
                    .filter((u: AuthUser) => nullCustomerIds.includes(u.id) && !!u.email)
                    .map((u: AuthUser) => u.email as string)
                emails.push(...authEmails)
            }
        }

        if (campaign.audience === 'all' || campaign.audience === 'drop_signups') {
            const { data: signups, error: dropErr } = await supabase
                .from('drop_signups')
                .select('email')

            console.log(`Drop signups: ${signups?.length ?? 0}, error: ${dropErr?.message ?? 'none'}`)
            emails.push(...(signups ?? []).map((s: { email: string }) => s.email).filter(Boolean))
        }

        // Deduplicate + normalise
        emails = [...new Set(emails.map(e => e.toLowerCase().trim()).filter(Boolean))]
        console.log(`Total unique emails: ${emails.length}`)

        if (emails.length === 0) {
            await supabase
                .from('campaigns')
                .update({ status: 'no_recipients', recipients_count: 0 })
                .eq('id', campaign_id)
            return jsonResponse(
                { success: false, error: 'No emails found for this audience.' },
                400
            )
        }

        // ── 7. Send via Resend ─────────────────────────────────────────────────────
        let successCount = 0

        for (let i = 0; i < emails.length; i += 50) {
            const batch = emails.slice(i, i + 50)

            const res = await fetch('https://api.resend.com/emails/batch', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    batch.map(to => ({
                        from: fromAddress,
                        to,
                        subject: campaign.subject,
                        html: campaign.body_html,
                    }))
                ),
            })

            const resText = await res.text()
            console.log(`Resend batch [${i}–${i + batch.length}]: HTTP ${res.status}`, resText.slice(0, 200))

            if (res.ok) successCount += batch.length
        }

        await supabase
            .from('campaigns')
            .update({
                status: successCount > 0 ? 'sent' : 'failed',
                sent_at: new Date().toISOString(),
                recipients_count: successCount,
            })
            .eq('id', campaign_id)

        return jsonResponse({ success: successCount > 0, sent: successCount, total: emails.length })

    } catch (err) {
        console.error('Unhandled error:', err)
        return jsonResponse({ success: false, error: 'Internal server error.' }, 500)
    }
})
