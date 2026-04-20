const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'snack55-n8n1.q7pa8v.easypanel.host';
const WF_ID = 'xCurICBJWO44Zs7p';

// Fast version: pgrep only returns a handful of java PIDs, not thousands of /proc entries
const FAST_KILL_FN = `
kill_java_in_dir() {
  local DIR="$1"
  local JAVA_PIDS
  JAVA_PIDS=$(pgrep -x java 2>/dev/null || true)
  [ -z "$JAVA_PIDS" ] && return 0
  local killed=0
  for pid in $JAVA_PIDS; do
    local cwd
    cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null) || continue
    [[ "$cwd" == "$DIR"* ]] || continue
    echo "  Matando Java PID $pid"
    kill -15 "$pid" 2>/dev/null || true
    killed=$((killed+1))
  done
  [ $killed -gt 0 ] && sleep 3
  for pid in $JAVA_PIDS; do
    local cwd
    cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null) || continue
    [[ "$cwd" == "$DIR"* ]] || continue
    kill -9 "$pid" 2>/dev/null || true
  done
}
`;

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE, path, method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
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

// Old slow pattern to replace
const OLD_FN_PATTERN = /kill_java_in_dir\(\) \{[\s\S]*?^}/m;

async function main() {
  const r = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  const wf = r.body;
  let count = 0;

  for (const node of wf.nodes) {
    const cmd = node.parameters?.command;
    if (!cmd) continue;
    if (!cmd.includes('kill_java_in_dir()')) continue;

    // Replace the old slow function with the fast pgrep version
    const newCmd = cmd.replace(
      /kill_java_in_dir\(\) \{[\s\S]*?\n\}/,
      FAST_KILL_FN.trim()
    );

    if (newCmd !== cmd) {
      node.parameters.command = newCmd;
      console.log(`✓ Fixed node: ${node.name}`);
      count++;
    } else {
      console.log(`⚠ No match in node: ${node.name} (function pattern may differ)`);
      // Show first 300 chars of the kill fn to debug
      const idx = cmd.indexOf('kill_java_in_dir()');
      if (idx >= 0) console.log('  Found at:', cmd.substring(idx, idx+200));
    }
  }

  if (count === 0) {
    console.log('Nothing to update');
    return;
  }

  const res = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wf.name, nodes: wf.nodes, connections: wf.connections,
    settings: wf.settings || {}, staticData: wf.staticData || null
  });

  if (res.status > 201) {
    console.error('PUT failed:', res.status, JSON.stringify(res.body).substring(0, 200));
    return;
  }

  // Verify
  for (const node of res.body.nodes) {
    if (node.parameters?.command?.includes('pgrep -x java')) {
      console.log(`✓ Verified fast kill fn in: ${node.name}`);
    }
  }
  console.log('Done!');
}

main().catch(e => console.error('FATAL:', e.message));
