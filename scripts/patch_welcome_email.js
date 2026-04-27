const fs = require('fs');
const path = '/opt/mc-api/server.js';
let code = fs.readFileSync(path, 'utf8');

const welcomeEmailFn = `
// ---- Welcome email ---------------------------------------------------------
async function sendWelcomeEmail(toEmail, serverName, planStatus) {
  const RESEND_KEY = process.env.RESEND_API_KEY || '';
  if (!RESEND_KEY || !toEmail) return;
  const planLabel = { pro_4gb:'Pro 4GB', pro_6gb:'Pro 6GB', pro_8gb:'Pro 8GB', pro_12gb:'Pro 12GB' }[planStatus] || planStatus;
  const srvName = serverName || 'tu servidor';
  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#0B0F1A;font-family:Helvetica Neue,Arial,sans-serif">' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F1A;padding:40px 20px"><tr><td align="center">' +
    '<table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;border:1px solid rgba(34,197,94,0.2);overflow:hidden;max-width:560px;width:100%">' +
    '<tr><td style="background:linear-gradient(135deg,#0d1f14,#111827);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(34,197,94,0.15)">' +
    '<p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;color:#22C55E;text-transform:uppercase">Bienvenido a MineLab</p>' +
    '<h1 style="margin:0;font-size:28px;font-weight:900;color:#fff">&#x1F9F1; Tu servidor est&#xE1; listo!</h1>' +
    '</td></tr>' +
    '<tr><td style="padding:36px 40px">' +
    '<p style="margin:0 0 16px;color:#9CA3AF;font-size:15px;line-height:1.6">Gracias por unirte a MineLab. Tu plan <strong style="color:#22C55E">' + planLabel + '</strong> ya est&#xE1; activo y tu servidor <strong style="color:#fff">&quot;' + srvName + '&quot;</strong> est&#xE1; siendo creado ahora mismo.</p>' +
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F1A;border:1px solid rgba(34,197,94,0.1);border-radius:12px;padding:20px;margin-bottom:24px">' +
    '<tr><td style="color:#D1FAE5;font-size:14px;padding:6px 0">&#x1F916; &nbsp;La IA ya puede gestionar tu servidor</td></tr>' +
    '<tr><td style="color:#D1FAE5;font-size:14px;padding:6px 0">&#x1F9E9; &nbsp;Instala mods y modpacks con un mensaje</td></tr>' +
    '<tr><td style="color:#D1FAE5;font-size:14px;padding:6px 0">&#x1F4AC; &nbsp;Controla la consola con lenguaje natural</td></tr>' +
    '<tr><td style="color:#D1FAE5;font-size:14px;padding:6px 0">&#x1F4C2; &nbsp;Gestiona archivos sin tocar nada t&#xE9;cnico</td></tr>' +
    '</table>' +
    '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">' +
    '<a href="https://minelab.gg/panel" style="display:inline-block;background:#22C55E;color:#000;font-weight:900;font-size:15px;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;padding:15px 40px;border-radius:10px">Ir al panel &rarr;</a>' +
    '</td></tr></table>' +
    '<p style="margin:24px 0 0;color:#6B7280;font-size:13px;text-align:center">&#xBF;Tienes alguna duda? Estamos en <a href="https://discord.gg/wUJZkQxAQk" style="color:#22C55E">Discord</a>.</p>' +
    '</td></tr>' +
    '<tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">' +
    '<p style="margin:0;color:#4B5563;font-size:12px">MineLab &middot; minelab.gg</p>' +
    '</td></tr></table></td></tr></table></body></html>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'MineLab <noreply@minelab.gg>', to: [toEmail], subject: '\\u00a1Bienvenido a MineLab! Tu servidor est\\u00e1 listo \\uD83E\\uDDF1', html }),
    });
    console.log('[Welcome] email sent to ' + toEmail + ' status=' + r.status);
  } catch(e) {
    console.error('[Welcome] email error:', e.message);
  }
}
// ---------------------------------------------------------------------------
`;

const webhookLine = "app.post('/webhook/stripe'";
if (!code.includes('sendWelcomeEmail')) {
  code = code.replace(webhookLine, welcomeEmailFn + '\n' + webhookLine);
  console.log('OK: welcome function inserted');
} else {
  console.log('SKIP: welcome function already present');
}

const callSnippet = `
    // ---- Send welcome email on new subscription ----------------------------
    if (activated && stripeEmail) {
      let welcomeServerName = null;
      try {
        if (serverId) {
          const snRes = await fetch(SUPABASE_URL + '/rest/v1/mc_servers?id=eq.' + serverId + '&select=server_name',
            { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } });
          const snData = await snRes.json();
          welcomeServerName = snData[0] && snData[0].server_name;
        }
      } catch(_) {}
      sendWelcomeEmail(stripeEmail, welcomeServerName, planStatus);
    }
    // -----------------------------------------------------------------------

`;

const insertPoint = "    if (!activated) {";
if (!code.includes('sendWelcomeEmail(stripeEmail')) {
  code = code.replace(insertPoint, callSnippet + insertPoint);
  console.log('OK: welcome email call inserted');
} else {
  console.log('SKIP: welcome email call already present');
}

fs.writeFileSync(path, code);
console.log('DONE: server.js updated');
