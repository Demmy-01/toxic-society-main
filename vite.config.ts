import { defineConfig, type Plugin, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@supabase/supabase-js'

// Plugin to resolve figma:asset/... imports as placeholder images
function figmaAssetPlugin(): Plugin {
  const PLACEHOLDER =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88uNDPQAIhQMbT46APQAAAABJRU5ErkJggg=='
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) return '\0figma-asset:' + id
    },
    load(id) {
      if (id.startsWith('\0figma-asset:figma:asset/')) return `export default ${JSON.stringify(PLACEHOLDER)}`
    },
  }
}

// Local mock for Vercel's /api/verify-payment
// This ensures `npm run dev` works out of the box without needing `vercel dev`
function localApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/verify-payment', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method not allowed.' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { reference, orderData } = data;

            const PAYSTACK_SECRET_KEY = env.PAYSTACK_SECRET_KEY;
            const SUPABASE_URL = env.VITE_SUPABASE_URL;
            const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

            const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
              headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
            });
            const paystackData = await verifyRes.json();

            if (!verifyRes.ok || paystackData.data?.status !== 'success') {
              res.statusCode = 402;
              res.end(JSON.stringify({ success: false, error: 'Payment not confirmed' }));
              return;
            }

            const txData = paystackData.data;
            const authHeader = req.headers.authorization;
            const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;

            const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            });
            const { items, totalUsd, customerId, discountCode, discountAmount, discountId } = orderData;
            
            const payload = {
              items, total: totalUsd, status: 'paid', customer_id: customerId ?? null,
              discount_code: discountCode ?? null, discount_amount: discountAmount ?? 0,
              payment_reference: txData.reference, payment_gateway: 'paystack',
              payment_amount_kobo: txData.amount, payment_currency: txData.currency,
              paid_at: txData.paid_at ?? new Date().toISOString()
            };

            let orderResult = await supabase.from('orders').insert(payload).select('id').single();
            if (orderResult.error) {
              orderResult = await supabase.from('orders').insert({
                items, total: totalUsd, status: 'paid', customer_id: customerId ?? null
              }).select('id').single();
            }
            if (orderResult.error) throw orderResult.error;

            if (discountId) {
              const { data: discRow } = await supabase.from('discounts').select('uses').eq('id', discountId).single();
              if (discRow) await supabase.from('discounts').update({ uses: (discRow.uses ?? 0) + 1 }).eq('id', discountId);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, orderId: orderResult.data.id }));
          } catch (e: any) {
            console.error('Local API Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      figmaAssetPlugin(),
      localApiPlugin(env),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
