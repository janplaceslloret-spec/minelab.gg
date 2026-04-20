import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
WF_ID = 'dlSgSptMPFIHdIC6'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{WF_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

# Fix Download and Extract SSH command to use explicit references
for node in wf['nodes']:
    if node.get('name') == 'Download and Extract':
        node['parameters']['command'] = (
            "={{ const s = $('Pick modpack file').first().json.server_id; "
            "const u = $('Pick modpack file').first().json.download_url; "
            "`TMP=\"/tmp/modpack_${s}\"\n"
            "rm -rf \"$TMP\" && mkdir -p \"$TMP\"\n"
            "wget -q \"${u}\" -O \"$TMP/pack.zip\"\n"
            "if [ $? -ne 0 ]; then echo \"ERROR:DOWNLOAD_FAILED\"; exit 1; fi\n"
            "unzip -o \"$TMP/pack.zip\" -d \"$TMP/extracted\" > /dev/null 2>&1\n"
            "if [ ! -f \"$TMP/extracted/manifest.json\" ]; then echo \"ERROR:NO_MANIFEST\"; exit 1; fi\n"
            "cat \"$TMP/extracted/manifest.json\"` }}"
        )
        print('Fixed Download and Extract: using explicit $("Pick modpack file") references')

# Rebuild connections for INSTALL_MODPACK:
# Pick modpack file -> [Progress: Downloading (parallel), Download and Extract (direct)]
# Download and Extract -> Parse Manifest
# Parse Manifest -> [Progress: Resolving (parallel), Get File URLs Batch (direct)]
# Get File URLs Batch -> Build Install Script
# Build Install Script -> [Progress: Installing (parallel), SSH Install Modpack (direct)] (already done)
# SSH Install Modpack -> Save Modpack to Supabase
# Save Modpack to Supabase -> [Progress: Restarting (parallel), Restart Server (direct)] (already done)
# Restart Server -> Progress: Done

conns = wf['connections']

# Pick modpack file -> [Progress: Downloading, Download and Extract] (parallel)
conns['Pick modpack file'] = {
    "main": [[
        {"node": "Progress: Downloading", "type": "main", "index": 0},
        {"node": "Download and Extract",   "type": "main", "index": 0}
    ]]
}
print('Pick modpack file -> [Progress: Downloading, Download and Extract] (parallel)')

# Progress: Downloading has no outgoing
conns['Progress: Downloading'] = {"main": [[]]}

# Download and Extract -> Parse Manifest
conns['Download and Extract'] = {
    "main": [[{"node": "Parse Manifest", "type": "main", "index": 0}]]
}
print('Download and Extract -> Parse Manifest')

# Parse Manifest -> [Progress: Resolving, Get File URLs Batch] (parallel)
conns['Parse Manifest'] = {
    "main": [[
        {"node": "Progress: Resolving",    "type": "main", "index": 0},
        {"node": "Get File URLs Batch",    "type": "main", "index": 0}
    ]]
}
print('Parse Manifest -> [Progress: Resolving, Get File URLs Batch] (parallel)')

# Progress: Resolving has no outgoing
conns['Progress: Resolving'] = {"main": [[]]}

# Get File URLs Batch -> Build Install Script (keep existing, just be explicit)
conns['Get File URLs Batch'] = {
    "main": [[{"node": "Build Install Script", "type": "main", "index": 0}]]
}
print('Get File URLs Batch -> Build Install Script')

# Build Install Script -> [Progress: Installing (parallel), SSH Install Modpack (direct)] (already done but reinforce)
conns['Build Install Script'] = {
    "main": [[
        {"node": "Progress: Installing",  "type": "main", "index": 0},
        {"node": "SSH Install Modpack",   "type": "main", "index": 0}
    ]]
}
print('Build Install Script -> [Progress: Installing, SSH Install Modpack] (parallel)')

# Progress: Installing has no outgoing
conns['Progress: Installing'] = {"main": [[]]}

# SSH Install Modpack -> Save Modpack to Supabase
conns['SSH Install Modpack'] = {
    "main": [[{"node": "Save Modpack to Supabase", "type": "main", "index": 0}]]
}

# Save Modpack to Supabase -> [Progress: Restarting, Restart Server] (parallel)
conns['Save Modpack to Supabase'] = {
    "main": [[
        {"node": "Progress: Restarting", "type": "main", "index": 0},
        {"node": "Restart Server",       "type": "main", "index": 0}
    ]]
}

# Restart Server -> Progress: Done
conns['Restart Server'] = {
    "main": [[{"node": "Progress: Done", "type": "main", "index": 0}]]
}
conns['Progress: Restarting'] = {"main": [[]]}
conns['Progress: Done'] = {"main": [[]]}

print('SSH -> Supabase -> [Progress: Restarting, Restart Server] -> Progress: Done (all set)')

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
        print('\nINSTALL_MODPACK flow fixed!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
