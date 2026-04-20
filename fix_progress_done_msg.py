import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'

# Fix INSTALL_MODPACK Progress: Done - remove dynamic message with embedded quotes
req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/dlSgSptMPFIHdIC6', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

for node in wf['nodes']:
    if node.get('name') == 'Progress: Done':
        node['parameters']['workflowInputs']['value']['message'] = 'Instalacion completada'
        print('Fixed Progress: Done message to static string')

update_payload = {
    "name": wf['name'], "nodes": wf['nodes'], "connections": wf['connections'],
    "settings": wf.get('settings', {}), "staticData": wf.get('staticData')
}
data = json.dumps(update_payload).encode()
req2 = urllib.request.Request(
    f'{N8N_BASE}/api/v1/workflows/dlSgSptMPFIHdIC6', data=data,
    headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json'}, method='PUT'
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        for n in result['nodes']:
            if n['name'] == 'Progress: Done':
                msg = n['parameters']['workflowInputs']['value'].get('message','')
                print(f'Progress: Done message saved as: {msg}')
        print('Done!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:300]}')
