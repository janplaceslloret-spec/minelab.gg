import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
SM_ID = 'FafyAxLWGxmSnTJu'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{SM_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

for node in wf['nodes']:
    if node.get('name') in ('INSTALL_PLUGIN', 'INSTALL_MODPACK'):
        old_tv = node.get('typeVersion')
        node['typeVersion'] = 2.2
        print(f"Fixed {node['name']} typeVersion: {old_tv} -> 2.2")

update_payload = {
    "name": wf['name'], "nodes": wf['nodes'], "connections": wf['connections'],
    "settings": wf.get('settings', {}), "staticData": wf.get('staticData')
}
data = json.dumps(update_payload).encode()
req2 = urllib.request.Request(
    f'{N8N_BASE}/api/v1/workflows/{SM_ID}', data=data,
    headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json'}, method='PUT'
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        for n in result['nodes']:
            if n.get('name') in ('INSTALL_PLUGIN', 'INSTALL_MODPACK'):
                print(f"  {n['name']} typeVersion now: {n.get('typeVersion')}")
        print('Done')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:300]}')
