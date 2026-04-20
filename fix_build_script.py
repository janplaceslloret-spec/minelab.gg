import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
WF_ID = 'c4Be1nEBsCbXNOgQ'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{WF_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

# Fix Build Plugin Script:
# n8n HTTP Request splits array responses into individual items
# So $json is a single version OBJECT (not an array)
new_build_code = r"""const hits = $('Search Plugins').first().json.hits || [];
const hit = hits[0] || {};

// $json is the first version item (n8n splits array responses into items)
const version = $('Get Plugin Version').first().json;
const serverId = $('Validate Paper').first().json.server_id;
const pluginsPath = `/opt/minecraft/servers/${serverId}/plugins`;
const resolved = [];

const files = version.files || [];
const file = files.find(f => f.primary) || files[0];
if (file && file.url) {
  resolved.push({
    fileName: file.filename,
    downloadUrl: file.url,
    modId: hit.project_id || version.project_id || 'unknown'
  });
}

if (resolved.length === 0) {
  return [{json: {server_id: serverId, files: [], script: 'echo "Plugin no encontrado"'}}];
}

const lines = [`mkdir -p ${pluginsPath}`];
for (const f of resolved) {
  lines.push(`wget -q "${f.downloadUrl}" -O "${pluginsPath}/${f.fileName}"`);
}
lines.push('echo "Plugin instalado"');

return [{json: {server_id: serverId, files: resolved, script: lines.join(' && ')}}];
"""

for node in wf['nodes']:
    if node.get('name') == 'Build Plugin Script':
        node['parameters']['jsCode'] = new_build_code
        print('Fixed Build Plugin Script: $json is single version object, not array')

update_payload = {
    "name": wf['name'], "nodes": wf['nodes'], "connections": wf['connections'],
    "settings": wf.get('settings', {}), "staticData": wf.get('staticData')
}
data = json.dumps(update_payload).encode()
req2 = urllib.request.Request(
    f'{N8N_BASE}/api/v1/workflows/{WF_ID}', data=data,
    headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json'}, method='PUT'
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        for n in result['nodes']:
            if n['name'] == 'Build Plugin Script':
                code = n['parameters'].get('jsCode','')[:200]
                print(f'Updated code: {code}')
        print('Done!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
