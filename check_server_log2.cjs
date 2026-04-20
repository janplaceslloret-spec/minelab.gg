const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'snack55-n8n1.q7pa8v.easypanel.host';
const SERVER_ID = 'a5dd48ec-ad35-43ee-98d4-dc6dd89a504b';
const SSH_CRED_ID = 'yCa4pOJlK0uEQY4C';
const WEBHOOK_PATH = 'tmp-check-log-' + Date.now();

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE,
      path,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function webhookPost(path, bodyStr) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(bodyStr);
    const options = {
      hostname: N8N_BASE,
      path: '/webhook/' + path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': buf.length },
      timeout: 30000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(buf);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const SSH_CMD = [
    `BASE="/opt/minecraft/servers/${SERVER_ID}"`,
    `echo "=== SCREEN ==="`,
    `screen -ls | grep ${SERVER_ID.substring(0,8)} || echo "NO_SCREEN"`,
    `echo "=== JAVA PROCS ==="`,
    `ps aux | grep java | grep ${SERVER_ID.substring(0,8)} | head -5 || echo "NO_JAVA"`,
    `echo "=== LATEST LOG (last 60 lines) ==="`,
    `tail -n 60 "$BASE/logs/latest.log" 2>/dev/null || echo "NO_LATEST_LOG"`,
    `echo "=== STARTUP LOG ==="`,
    `tail -n 50 "$BASE/logs/startup.log" 2>/dev/null || echo "NO_STARTUP_LOG"`,
    `echo "=== CRASH REPORTS ==="`,
    `ls -lt "$BASE/crash-reports/" 2>/dev/null | head -5 || echo "NO_CRASHES"`,
    `CRASH=$(ls -t "$BASE/crash-reports/"*.txt 2>/dev/null | head -1)`,
    `[ -n "$CRASH" ] && tail -n 40 "$CRASH" || true`
  ].join('\n');

  const tmpWf = {
    name: 'TMP_LOG_CHECK',
    active: false,
    nodes: [
      {
        id: 'wh1', name: 'Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2,
        position: [0, 0],
        parameters: { httpMethod: 'POST', path: WEBHOOK_PATH, responseMode: 'responseNode', options: {} }
      },
      {
        id: 'ssh1', name: 'SSH', type: 'n8n-nodes-base.ssh', typeVersion: 1,
        position: [300, 0],
        credentials: { sshPrivateKey: { id: SSH_CRED_ID, name: 'SSH Private Key account' } },
        parameters: { authentication: 'privateKey', command: SSH_CMD }
      },
      {
        id: 'res1', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1,
        position: [600, 0],
        parameters: {
          respondWith: 'json',
          responseBody: '={{ JSON.stringify({ out: $("SSH").item.json.stdout, err: $("SSH").item.json.stderr }) }}'
        }
      }
    ],
    connections: {
      'Webhook': { main: [[{ node: 'SSH', type: 'main', index: 0 }]] },
      'SSH': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
    },
    settings: {}
  };

  console.log('Creating temp workflow...');
  const cr = await apiRequest('POST', '/api/v1/workflows', tmpWf);
  if (cr.status > 201) {
    console.error('Create failed:', cr.status, JSON.stringify(cr.body).substring(0, 300));
    return;
  }
  const wfId = cr.body.id;
  console.log('Workflow ID:', wfId);

  // Activate
  await apiRequest('POST', '/api/v1/workflows/' + wfId + '/activate');
  console.log('Activated. Waiting 2s...');
  await sleep(2000);

  // Trigger
  console.log('Calling webhook...');
  const wr = await webhookPost(WEBHOOK_PATH, '{}');
  console.log('\n=== SERVER STATE ===');
  try {
    const parsed = JSON.parse(wr.body);
    console.log(parsed.out || wr.body);
    if (parsed.err) console.log('STDERR:', parsed.err);
  } catch(e) {
    console.log(wr.body);
  }

  // Cleanup
  await apiRequest('DELETE', '/api/v1/workflows/' + wfId);
  console.log('\n[Temp workflow deleted]');
}

main().catch(err => console.error('FATAL:', err.message));
