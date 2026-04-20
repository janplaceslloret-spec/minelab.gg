const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'snack55-n8n1.q7pa8v.easypanel.host';
const SERVER_ID = 'a5dd48ec-ad35-43ee-98d4-dc6dd89a504b';

// We'll need to find the SSH credential ID from an existing workflow
// Let's get it from APAGAR ENCENDER REINICIAR (xCurICBJWO44Zs7p)
function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE,
      path: path,
      method: method,
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

async function main() {
  // Get SSH credential ID from existing workflow
  const wfResp = await apiRequest('GET', '/api/v1/workflows/xCurICBJWO44Zs7p');
  const wf = wfResp.body;

  let sshCredId = null;
  for (const node of wf.nodes) {
    if (node.type === 'n8n-nodes-base.ssh' && node.credentials?.sshApi) {
      sshCredId = node.credentials.sshApi.id;
      console.log('Found SSH credential ID:', sshCredId);
      break;
    }
  }

  if (!sshCredId) {
    console.error('Could not find SSH credential');
    console.log('Node types:', wf.nodes.map(n => n.type + ':' + n.name).join(', '));
    return;
  }

  // Create a temporary workflow with webhook + SSH + respond
  const tmpWf = {
    name: 'TMP_CHECK_LOG_' + Date.now(),
    active: true,
    nodes: [
      {
        id: 'webhook1',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [0, 0],
        parameters: {
          httpMethod: 'POST',
          path: 'tmp-check-log-arellanofran',
          responseMode: 'responseNode',
          options: {}
        }
      },
      {
        id: 'ssh1',
        name: 'SSH Check',
        type: 'n8n-nodes-base.ssh',
        typeVersion: 1,
        position: [300, 0],
        credentials: { sshApi: { id: sshCredId, name: 'SSH' } },
        parameters: {
          authentication: 'privateKey',
          command: `BASE="/opt/minecraft/servers/${SERVER_ID}"; screen -ls | grep ${SERVER_ID} || echo "NO_SCREEN"; tail -n 80 "$BASE/logs/latest.log" 2>/dev/null || echo "NO_LOG"; tail -n 40 "$BASE/logs/startup.log" 2>/dev/null || true`
        }
      },
      {
        id: 'respond1',
        name: 'Respond',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [600, 0],
        parameters: {
          respondWith: 'json',
          responseBody: '={{ JSON.stringify({ stdout: $("SSH Check").item.json.stdout }) }}'
        }
      }
    ],
    connections: {
      'Webhook': { main: [[{ node: 'SSH Check', type: 'main', index: 0 }]] },
      'SSH Check': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
    },
    settings: {}
  };

  console.log('Creating temporary workflow...');
  const createResp = await apiRequest('POST', '/api/v1/workflows', tmpWf);
  if (createResp.status !== 200 && createResp.status !== 201) {
    console.error('Failed to create workflow:', createResp.status, JSON.stringify(createResp.body).substring(0, 300));
    return;
  }
  const createdWf = createResp.body;
  console.log('Created workflow ID:', createdWf.id);

  // Trigger it
  await new Promise(r => setTimeout(r, 2000));

  const triggerResp = await apiRequest('POST', '/api/v1/workflows/' + createdWf.id + '/activate', null);
  console.log('Activate:', triggerResp.status);

  // Call the webhook
  await new Promise(r => setTimeout(r, 1000));

  const whResp = await new Promise((resolve, reject) => {
    const options = {
      hostname: N8N_BASE,
      path: '/webhook/tmp-check-log-arellanofran',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': 2 }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write('{}');
    req.end();
  });

  console.log('\n=== SERVER LOG ===');
  try {
    const parsed = JSON.parse(whResp.body);
    console.log(parsed.stdout || whResp.body);
  } catch(e) {
    console.log(whResp.body);
  }

  // Cleanup
  await apiRequest('DELETE', '/api/v1/workflows/' + createdWf.id);
  console.log('\nTemp workflow deleted.');
}

main().catch(err => console.error('ERROR:', err.message));
