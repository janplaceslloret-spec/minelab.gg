#!/bin/bash
# Run this on the VPS to add the Stripe webhook endpoint to mc-api
# Usage: bash vps-stripe-patch.sh

set -e

SERVER_JS="/opt/mc-api/server.js"

# Check if already patched
if grep -q "webhook/stripe" "$SERVER_JS"; then
  echo "Already patched — /webhook/stripe already exists in server.js"
  exit 0
fi

# Find the line number of app.listen so we can insert before it
LISTEN_LINE=$(grep -n "app.listen" "$SERVER_JS" | head -1 | cut -d: -f1)
echo "app.listen found at line $LISTEN_LINE — inserting Stripe webhook before it"

# Build the new endpoint block
read -r -d '' STRIPE_ENDPOINT << 'ENDPOINT'

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
// Maps the Stripe payment link slug (last segment of the URL) to plan_status.
const STRIPE_LINK_TO_PLAN = {
  '8x228s2LKcZN3lK3As3AY01': 'pro_4gb',
  '4gM5kE1HG6Bpg8w7QI3AY02': 'pro_6gb',
  '14AdRa2LK2l99K8gne3AY03': 'pro_8gb',
  'bJe7sM1HGe3R3lK2wo3AY05': 'pro_12gb',
};

// Raw body needed for signature verification in the future.
// For now we parse as JSON and trust the event type.
app.post("/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
    event = JSON.parse(raw);
  } catch (err) {
    console.error('[Stripe] Invalid JSON:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const serverId    = session.client_reference_id;
    const paymentLink = session.payment_link || '';
    const stripeEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase();

    // Determine plan from payment link slug
    let planStatus = 'pro_4gb'; // default fallback
    for (const [slug, plan] of Object.entries(STRIPE_LINK_TO_PLAN)) {
      if (paymentLink.includes(slug)) { planStatus = plan; break; }
    }

    console.log(`[Stripe] checkout.session.completed | serverId=${serverId} | plan=${planStatus} | email=${stripeEmail}`);

    let activated = false;

    // PRIMARY PATH: use client_reference_id (serverId) — email-independent
    if (serverId) {
      try {
        const serverRes = await fetch(
          `${SUPABASE_URL}/rest/v1/mc_servers?id=eq.${serverId}&select=user_id`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
        );
        const serverRows = await serverRes.json();
        const userId = serverRows[0]?.user_id;

        if (userId) {
          // Update plan in profiles
          await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ plan_status: planStatus }),
          });

          // Mark server as paid
          await fetch(`${SUPABASE_URL}/rest/v1/mc_servers?id=eq.${serverId}`, {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({ status: 'paid' }),
          });

          console.log(`[Stripe] ✓ Activated ${planStatus} for user ${userId} via serverId`);
          activated = true;
        } else {
          console.warn(`[Stripe] serverId ${serverId} not found in mc_servers`);
        }
      } catch (err) {
        console.error('[Stripe] Primary path error:', err);
      }
    }

    // FALLBACK PATH: match by email if primary path failed
    if (!activated && stripeEmail) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${stripeEmail}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ plan_status: planStatus }),
        });
        console.log(`[Stripe] ✓ Activated ${planStatus} for email ${stripeEmail} via fallback`);
        activated = true;
      } catch (err) {
        console.error('[Stripe] Fallback path error:', err);
      }
    }

    if (!activated) {
      console.error(`[Stripe] ✗ Could not activate plan — no serverId and no email match`);
    }
  }

  res.json({ received: true });
});
// ─────────────────────────────────────────────────────────────────────────────

ENDPOINT

# Insert before app.listen line using Python (more reliable than sed for multiline)
python3 - "$SERVER_JS" "$LISTEN_LINE" "$STRIPE_ENDPOINT" << 'PYEOF'
import sys

server_js_path = sys.argv[1]
insert_before_line = int(sys.argv[2]) - 1  # convert to 0-based index
new_block = sys.argv[3]

with open(server_js_path, 'r') as f:
    lines = f.readlines()

lines.insert(insert_before_line, new_block + '\n')

with open(server_js_path, 'w') as f:
    f.writelines(lines)

print(f"Inserted Stripe webhook block before line {insert_before_line + 1}")
PYEOF

echo "Restarting mc-api..."
pm2 restart mc-api && pm2 logs mc-api --lines 20 --nostream

echo ""
echo "Done! Now configure Stripe Dashboard:"
echo "  Webhook URL: https://api.fluxoai.co/webhook/stripe"
echo "  Event:       checkout.session.completed"
