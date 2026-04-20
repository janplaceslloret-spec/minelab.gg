import json, urllib.request, urllib.error, uuid

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
WF_ID = 'c4Be1nEBsCbXNOgQ'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{WF_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

# 1. Update Search Plugins node to use Modrinth
for node in wf['nodes']:
    if node.get('name') == 'Search Plugins':
        node['parameters'] = {
            "url": "https://api.modrinth.com/v2/search",
            "sendQuery": True,
            "queryParameters": {
                "parameters": [
                    {"name": "query", "value": "={{ $('Validate Paper').first().json.plugins[0] }}"},
                    {"name": "facets", "value": '=[["project_type:plugin"]]'},
                    {"name": "limit", "value": "5"}
                ]
            },
            "options": {}
        }
        # Remove any auth headers (Modrinth is free)
        node['parameters'].pop('sendHeaders', None)
        node['parameters'].pop('headerParameters', None)
        print('Updated Search Plugins -> Modrinth API')

# 2. Add new "Get Plugin Version" HTTP node between Search Plugins and Build Plugin Script
get_version_id = str(uuid.uuid4())
get_version_node = {
    "id": get_version_id,
    "name": "Get Plugin Version",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [410, 300],
    "parameters": {
        "url": "=https://api.modrinth.com/v2/project/{{ $('Search Plugins').first().json.hits[0].project_id }}/version",
        "sendQuery": True,
        "queryParameters": {
            "parameters": [
                {
                    "name": "loaders",
                    "value": '=["paper","spigot","bukkit","purpur"]'
                },
                {
                    "name": "game_versions",
                    "value": '=["{{ $(\'Validate Paper\').first().json.mc_version }}"]'
                }
            ]
        },
        "options": {}
    }
}
wf['nodes'].append(get_version_node)
print(f'Added Get Plugin Version node (id: {get_version_id})')

# 3. Update Build Plugin Script code to handle Modrinth format
new_build_code = r"""const hits = $('Search Plugins').first().json.hits || [];
const versions = $json; // Array from Get Plugin Version
const serverId = $('Validate Paper').first().json.server_id;
const requestedPlugins = $('Validate Paper').first().json.plugins;
const pluginsPath = `/opt/minecraft/servers/${serverId}/plugins`;
const resolved = [];

// Parse Modrinth version response (array of versions)
if (Array.isArray(versions) && versions.length > 0) {
  const version = versions[0];
  const files = version.files || [];
  const file = files.find(f => f.primary) || files[0];
  const hit = hits[0] || {};
  if (file && file.url) {
    resolved.push({
      fileName: file.filename,
      downloadUrl: file.url,
      modId: hit.project_id || hit.slug || 'unknown'
    });
  }
}

if (resolved.length === 0) {
  return [{json: {server_id: serverId, files: [], script: 'echo "Plugin no encontrado en Modrinth"'}}];
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
        print('Updated Build Plugin Script for Modrinth format')

# 4. Shift existing nodes rightward to make room for Get Plugin Version
# Get Plugin Version goes at x=410, Build Plugin Script moves to x=630
for node in wf['nodes']:
    name = node.get('name', '')
    if name in ('Build Plugin Script', 'Progress: Installing', 'SSH Install Plugins',
                 'Split for DB', 'Save to Supabase', 'Progress: Restarting',
                 'Restart Server', 'Progress: Done'):
        pos = node.get('position', [0, 0])
        node['position'] = [pos[0] + 220, pos[1]]

print('Shifted downstream nodes right by 220px')

# 5. Update connections
conns = wf['connections']

# Search Plugins -> Get Plugin Version
conns['Search Plugins'] = {
    "main": [[{"node": "Get Plugin Version", "type": "main", "index": 0}]]
}
# Get Plugin Version -> Build Plugin Script
conns['Get Plugin Version'] = {
    "main": [[{"node": "Build Plugin Script", "type": "main", "index": 0}]]
}
print('Search Plugins -> Get Plugin Version -> Build Plugin Script')

update_payload = {
    "name": wf['name'], "nodes": wf['nodes'], "connections": conns,
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
        print('\nFinal connections:')
        for src, val in result['connections'].items():
            for ct, outputs in val.items():
                for targets in outputs:
                    for t in targets:
                        print(f"  {src} -> {t.get('node')} [{ct}]")
        print('\nINSTALL_PLUGIN updated to use Modrinth!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
