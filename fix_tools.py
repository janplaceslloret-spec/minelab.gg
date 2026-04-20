import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
SM_ID = 'FafyAxLWGxmSnTJu'

SCHEMA = [
    {"id": "server_id", "displayName": "server_id", "required": False, "defaultMatch": False,
     "display": True, "canBeUsedToMatch": True, "type": "string"},
    {"id": "mods", "displayName": "mods", "required": False, "defaultMatch": False,
     "display": True, "canBeUsedToMatch": True, "type": "string"}
]

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{SM_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

for node in wf['nodes']:
    nm = node.get('name', '')

    if nm == 'INSTALL_PLUGIN':
        node['parameters'] = {
            "description": "Usa esta tool SOLO cuando el usuario pide instalar un plugin en un servidor Paper. NO devuelvas JSON manualmente. Llama siempre a esta tool.",
            "workflowId": {"__rl": True, "value": "c4Be1nEBsCbXNOgQ", "mode": "list",
                           "cachedResultUrl": "/workflow/c4Be1nEBsCbXNOgQ", "cachedResultName": "INSTALL_PLUGIN"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "server_id": "={{ $json.id }}",
                    "mods": '={{ $fromAI("mods") }}'
                },
                "matchingColumns": [],
                "schema": SCHEMA,
                "attemptToConvertTypes": False,
                "convertFieldsToString": False
            }
        }
        print('Fixed INSTALL_PLUGIN tool params')

    elif nm == 'INSTALL_MODPACK':
        node['parameters'] = {
            "description": "Usa esta tool SOLO cuando el usuario pide instalar un modpack en un servidor Fabric o Forge. AVISA que borrará los mods actuales. NO devuelvas JSON manualmente. Llama siempre a esta tool.",
            "workflowId": {"__rl": True, "value": "dlSgSptMPFIHdIC6", "mode": "list",
                           "cachedResultUrl": "/workflow/dlSgSptMPFIHdIC6", "cachedResultName": "INSTALL_MODPACK"},
            "workflowInputs": {
                "mappingMode": "defineBelow",
                "value": {
                    "server_id": "={{ $json.id }}",
                    "mods": '={{ $fromAI("mods") }}'
                },
                "matchingColumns": [],
                "schema": SCHEMA,
                "attemptToConvertTypes": False,
                "convertFieldsToString": False
            }
        }
        print('Fixed INSTALL_MODPACK tool params')

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
        # Verify
        for n in result['nodes']:
            nm2 = n.get('name', '')
            if nm2 in ['INSTALL_PLUGIN', 'INSTALL_MODPACK']:
                wi = n['parameters'].get('workflowInputs', {}).get('value', {})
                print(f'{nm2}: server_id={wi.get("server_id")}, mods={wi.get("mods")}')
        print('SERVER MANAGER updated successfully')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:300]}')
