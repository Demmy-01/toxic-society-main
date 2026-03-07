// @ts-nocheck — Deno edge function: https:// imports and Deno.* APIs are valid at runtime
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CustomerRow { email: string | null; user_id: string | null }
interface AuthUser { id: string; email?: string }

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { campaign_id } = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const resendApiKey = Deno.env.get('RESEND_API_KEY')!
        // Falls back to your verified domain if secret not set
        const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Toxic Society <noreply@christianevangelismministry.org.uk>'

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch campaign
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaign_id)
            .single()

        if (campaignError || !campaign) {
            return new Response(
                JSON.stringify({ success: false, error: `Campaign not found: ${campaignError?.message}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // Mark as sending
        await supabase.from('campaigns').update({ status: 'sending' }).eq('id', campaign_id)

        let emails: string[] = []

        // ── Customers ────────────────────────────────────────────────────────
        if (campaign.audience === 'all' || campaign.audience === 'customers') {
            const { data: customers, error: custErr } = await supabase
                .from('customers')
                .select('email, user_id')

            console.log(`Customers query: ${customers?.length ?? 0} rows, error: ${custErr?.message ?? 'none'}`)

            const directEmails = (customers ?? [])
                .map((c: CustomerRow) => c.email)
                .filter((e: string | null): e is string => !!e)

            emails.push(...directEmails)
            console.log(`Direct customer emails: ${directEmails.length}`)

            // Fallback for customers with null email → check auth.users
            const nullCustomerIds = (customers ?? [])
                .filter((c: CustomerRow) => !c.email && c.user_id)
                .map((c: CustomerRow) => c.user_id as string)

            if (nullCustomerIds.length > 0) {
                const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
                console.log(`Auth users: ${users?.length ?? 0}, error: ${authErr?.message ?? 'none'}`)
                const authEmails = (users ?? [])
                    .filter((u: AuthUser) => nullCustomerIds.includes(u.id) && !!u.email)
                    .map((u: AuthUser) => u.email as string)
                console.log(`Auth fallback emails: ${authEmails.length}`)
                emails.push(...authEmails)
            }
        }

        // ── Drop sign-ups ─────────────────────────────────────────────────────
        if (campaign.audience === 'all' || campaign.audience === 'drop_signups') {
            const { data: signups, error: dropErr } = await supabase
                .from('drop_signups')
                .select('email')

            console.log(`Drop signups: ${signups?.length ?? 0}, error: ${dropErr?.message ?? 'none'}`)
            emails.push(...(signups ?? []).map((s: { email: string }) => s.email).filter(Boolean))
        }

        // Deduplicate + normalise
        emails = [...new Set(emails.map(e => e.toLowerCase().trim()).filter(Boolean))]
        console.log(`Total unique emails to send: ${emails.length}`, emails)

        if (emails.length === 0) {
            await supabase.from('campaigns').update({ status: 'no_recipients', recipients_count: 0 }).eq('id', campaign_id)
            return new Response(
                JSON.stringify({ success: false, error: 'No emails found for this audience.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // ── Send via Resend ────────────────────────────────────────────────────
        let successCount = 0

        for (let i = 0; i < emails.length; i += 50) {
            const batch = emails.slice(i, i + 50)

            const res = await fetch('https://api.resend.com/emails/batch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
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

            if (res.ok) {
                successCount += batch.length
            }
        }

        await supabase.from('campaigns').update({
            status: successCount > 0 ? 'sent' : 'failed',
            sent_at: new Date().toISOString(),
            recipients_count: successCount,
        }).eq('id', campaign_id)

        return new Response(
            JSON.stringify({ success: successCount > 0, sent: successCount, total: emails.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (err) {
        console.error('Unhandled error:', err)
        return new Response(
            JSON.stringify({ success: false, error: String(err) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
