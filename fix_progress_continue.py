import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'

PROGRESS_NODES = ['Progress: Searching', 'Progress: Downloading', 'Progress: Resolving',
                  'Progress: Installing', 'Progress: Restarting', 'Progress: Done']

for wf_id, wf_name in [('c4Be1nEBsCbXNOgQ', 'INSTALL_PLUGIN'), ('dlSgSptMPFIHdIC6', 'INSTALL_MODPACK')]:
    req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{wf_id}', headers={'X-N8N-API-KEY': N8N_KEY})
    with urllib.request.urlopen(req) as r:
        wf = json.loads(r.read())

    fixed = 0
    for node in wf['nodes']:
        if node.get('name') in PROGRESS_NODES:
            # Set continueOnFail to true so progress failures don't abort the workflow
            node.setdefault('onError', 'continueRegularOutput')
            fixed += 1

    update_payload = {
        "name": wf['name'], "nodes": wf['nodes'], "connections": wf['connections'],
        "settings": wf.get('settings', {}), "staticData": wf.get('staticData')
    }
    data = json.dumps(update_payload).encode()
    req2 = urllib.request.Request(
        f'{N8N_BASE}/api/v1/workflows/{wf_id}', data=data,
        headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json'}, method='PUT'
    )
    try:
        with urllib.request.urlopen(req2) as r:
            result = json.loads(r.read())
            print(f'{wf_name}: set continueOnFail for {fixed} Progress nodes')
    except urllib.error.HTTPError as e:
        print(f'ERROR {wf_name}: {e.code} {e.read().decode()[:300]}')

print('Done!')
