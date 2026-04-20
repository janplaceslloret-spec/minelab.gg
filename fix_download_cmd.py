import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
WF_ID = 'dlSgSptMPFIHdIC6'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{WF_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

# Fix Download and Extract SSH command using n8n {{ }} template syntax
# These are evaluated as n8n expressions in the context of the node
download_cmd = """=TMP="/tmp/modpack_{{ $('Pick modpack file').first().json.server_id }}"
rm -rf "$TMP" && mkdir -p "$TMP"
wget -q "{{ $('Pick modpack file').first().json.download_url }}" -O "$TMP/pack.zip"
if [ $? -ne 0 ]; then echo "ERROR:DOWNLOAD_FAILED"; exit 1; fi
unzip -o "$TMP/pack.zip" -d "$TMP/extracted" > /dev/null 2>&1
if [ ! -f "$TMP/extracted/manifest.json" ]; then echo "ERROR:NO_MANIFEST"; exit 1; fi
cat "$TMP/extracted/manifest.json" """

for node in wf['nodes']:
    if node.get('name') == 'Download and Extract':
        node['parameters']['command'] = download_cmd
        print('Fixed Download and Extract command with {{ }} template syntax')
        print('Command preview:', download_cmd[:200])

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
            if n['name'] == 'Download and Extract':
                cmd = n['parameters'].get('command','')[:300]
                print(f'Saved command: {cmd}')
        print('Done!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
