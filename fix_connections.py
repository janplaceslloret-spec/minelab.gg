import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
SM_ID = 'FafyAxLWGxmSnTJu'

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{SM_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

conns = wf['connections']

# 1. Remove wrong entries from AI Agent ai_tool (INSTALL_PLUGIN, INSTALL_MODPACK)
if 'AI Agent' in conns and 'ai_tool' in conns['AI Agent']:
    original = conns['AI Agent']['ai_tool'][0]
    cleaned = [t for t in original if t.get('node') not in ('INSTALL_PLUGIN', 'INSTALL_MODPACK')]
    conns['AI Agent']['ai_tool'] = [cleaned]
    print(f'AI Agent ai_tool cleaned: {len(original)} -> {len(cleaned)} entries')

# 2. Add correct connections: INSTALL_PLUGIN -> ai_tool -> AI Agent
conns['INSTALL_PLUGIN'] = {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]}
conns['INSTALL_MODPACK'] = {"ai_tool": [[{"node": "AI Agent", "type": "ai_tool", "index": 0}]]}
print('Added INSTALL_PLUGIN -> AI Agent (ai_tool)')
print('Added INSTALL_MODPACK -> AI Agent (ai_tool)')

# 3. Verify all expected tools are connected
expected_tools = ['CONSOLA','UPDATE_SERVER_CONFIG','DIAGNOSE_AND_FIX','DELETE_WORLD',
                  'INSTALL_MODS','UNINSTALL_MOD','APAGAR_ENCENDER_REINICIAR','CHANGE_VERSION',
                  'INSTALL_PLUGIN','INSTALL_MODPACK']
print('\nTool connections check:')
for tool in expected_tools:
    connected = tool in conns and 'ai_tool' in conns[tool]
    print(f'  {"✓" if connected else "✗"} {tool}')

# Update
update_payload = {
    "name": wf['name'], "nodes": wf['nodes'], "connections": conns,
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
        final_conns = result['connections']
        print('\nFinal verification:')
        for tool in expected_tools:
            ok = tool in final_conns and 'ai_tool' in final_conns[tool]
            print(f'  {"✓" if ok else "✗"} {tool}')
        print('\nSERVER MANAGER connections fixed!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
