const fs = require('fs');
const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'snack55-n8n1.q7pa8v.easypanel.host';
const WF_ID = 'dlSgSptMPFIHdIC6';

// Read fixed code from file
const fixedCode = fs.readFileSync('C:\\Users\\panch\\minelab-deploy\\build_install_script_code.js', 'utf8');

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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 400)}`));
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Fetching workflow...');
  const wf = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  console.log('Workflow:', wf.name);

  let fixed = false;
  for (const node of wf.nodes) {
    if (node.name === 'Build Install Script') {
      console.log('Found node. Preview:', node.parameters.jsCode?.substring(0, 60));
      node.parameters.jsCode = fixedCode;
      fixed = true;
      console.log('Code replaced.');
      break;
    }
  }

  if (!fixed) {
    console.error('Node not found!');
    process.exit(1);
  }

  const updatePayload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null
  };

  console.log('Sending PUT...');
  const result = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, updatePayload);

  for (const n of result.nodes) {
    if (n.name === 'Build Install Script') {
      console.log('Saved OK. Preview:', n.parameters.jsCode?.substring(0, 100));
    }
  }
  console.log('Done!');
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
