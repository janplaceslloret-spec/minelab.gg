import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
CRED_SB = '5UN2S3jIQ9dGyWoa'
WF_ID = 'c4Be1nEBsCbXNOgQ'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{WF_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

print('Nodes in workflow:')
for n in wf['nodes']:
    print(f"  {n['name']} ({n['type']})")

print('\nCurrent connections:')
for src, val in wf['connections'].items():
    for ct, outputs in val.items():
        for targets in outputs:
            for t in targets:
                print(f"  {src} -> {t.get('node')} [{ct}]")

# Fix "Save to Supabase" node: remove mod_type field
for node in wf['nodes']:
    if node.get('name') == 'Save to Supabase':
        node['parameters'] = {
            "operation": "create",
            "tableId": "server_mods",
            "fieldsUi": {"fieldValues": [
                {"fieldId": "server_id",  "fieldValue": "={{ $json.server_id }}"},
                {"fieldId": "mod_name",   "fieldValue": "={{ $json.mod_name }}"},
                {"fieldId": "mod_id",     "fieldValue": "={{ $json.mod_id }}"},
                {"fieldId": "source",     "fieldValue": "={{ $json.source }}"},
                {"fieldId": "status",     "fieldValue": "={{ $json.status }}"}
            ]}
        }
        node['credentials'] = {"supabaseApi": {"id": CRED_SB, "name": "Supabase account 2"}}
        print('\nFixed Save to Supabase: removed mod_type')

# Rebuild connections correctly:
# SSH Install Plugins -> Split for DB -> Save to Supabase -> [Progress: Restarting (parallel), Restart Server (direct)]
# Restart Server -> Progress: Done
# Build Plugin Script -> [Progress: Installing (parallel), SSH Install Plugins (direct)]
conns = wf['connections']

# Remove ghost "Supabase Insert Plugin" references (it doesn't exist as a node)
for ghost in ['Supabase Insert Plugin']:
    if ghost in conns:
        del conns[ghost]
        print(f'Removed ghost connection source: {ghost}')

# Fix Build Plugin Script: parallel branch
conns['Build Plugin Script'] = {
    "main": [[
        {"node": "Progress: Installing", "type": "main", "index": 0},
        {"node": "SSH Install Plugins",  "type": "main", "index": 0}
    ]]
}
print('Build Plugin Script -> [Progress: Installing, SSH Install Plugins] (parallel)')

# Progress: Installing has no outgoing
conns['Progress: Installing'] = {"main": [[]]}

# SSH -> Split for DB
conns['SSH Install Plugins'] = {
    "main": [[{"node": "Split for DB", "type": "main", "index": 0}]]
}
print('SSH Install Plugins -> Split for DB')

# Split for DB -> Save to Supabase (already exists but let's be explicit)
conns['Split for DB'] = {
    "main": [[{"node": "Save to Supabase", "type": "main", "index": 0}]]
}
print('Split for DB -> Save to Supabase')

# Save to Supabase -> [Progress: Restarting (parallel), Restart Server (direct)]
conns['Save to Supabase'] = {
    "main": [[
        {"node": "Progress: Restarting", "type": "main", "index": 0},
        {"node": "Restart Server",       "type": "main", "index": 0}
    ]]
}
print('Save to Supabase -> [Progress: Restarting, Restart Server] (parallel)')

# Progress: Restarting has no outgoing
conns['Progress: Restarting'] = {"main": [[]]}

# Restart Server -> Progress: Done
conns['Restart Server'] = {
    "main": [[{"node": "Progress: Done", "type": "main", "index": 0}]]
}
print('Restart Server -> Progress: Done')

# Progress: Done has no outgoing
conns['Progress: Done'] = {"main": [[]]}

# Also fix SSH command to use explicit reference
for node in wf['nodes']:
    if node.get('name') == 'SSH Install Plugins':
        node['parameters']['command'] = "={{ $('Build Plugin Script').first().json.script }}"
        print("Fixed SSH command to use $('Build Plugin Script').first().json.script")

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
        print('\n=== FINAL CONNECTIONS ===')
        for src, val in result['connections'].items():
            for ct, outputs in val.items():
                for targets in outputs:
                    for t in targets:
                        print(f"  {src} -> {t.get('node')} [{ct}]")
        print('\nINSTALL_PLUGIN fixed!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
