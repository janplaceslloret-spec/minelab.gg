import json, urllib.request
N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
req = urllib.request.Request('https://snack55-n8n1.q7pa8v.easypanel.host/api/v1/workflows/dlSgSptMPFIHdIC6', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())
for n in data['nodes']:
    nm = n.get('name','')
    params = n.get('parameters',{})
    if nm in ('Download and Extract', 'Parse Manifest', 'Get File URLs Batch', 'Build Install Script', 'SSH Install Modpack'):
        print(f'=== {nm} ===')
        if 'jsCode' in params:
            print(params['jsCode'][:1000])
        elif 'command' in params:
            print('command:', str(params['command'])[:600])
        elif 'url' in params:
            print('url:', params['url'][:300])
            print('query:', json.dumps(params.get('queryParameters',{}))[:400])
        print()
