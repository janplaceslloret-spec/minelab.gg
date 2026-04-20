import json, urllib.request, urllib.error, uuid

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'

WORKFLOWS = [
    {
        'id': 'c4Be1nEBsCbXNOgQ',
        'name': 'INSTALL_PLUGIN',
        'restart_node': 'Restart Server',
        'return_code': """// Return success result to the AI Agent
const ctx = $('Build Plugin Script').first().json;
const server_id = ctx.server_id;
const files = ctx.files || [];
const names = files.map(f => f.fileName).join(', ');
return [{json: {
    success: true,
    server_id: server_id,
    installed: files.length,
    plugins: names,
    message: `Plugin${files.length > 1 ? 's' : ''} instalado${files.length > 1 ? 's' : ''}: ${names}`
}}];""",
        'return_pos': [2200, 300]
    },
    {
        'id': 'dlSgSptMPFIHdIC6',
        'name': 'INSTALL_MODPACK',
        'restart_node': 'Restart Server',
        'return_code': """// Return success result to the AI Agent
const ctx = $('Build Install Script').first().json;
return [{json: {
    success: true,
    server_id: ctx.server_id,
    modpack_name: ctx.modpack_name,
    mods_installed: ctx.mod_count,
    mods_skipped: ctx.skipped_count,
    message: `Modpack ${ctx.modpack_name} instalado con ${ctx.mod_count} mods`
}}];""",
        'return_pos': [2560, 300]
    }
]

for wf_config in WORKFLOWS:
    wf_id = wf_config['id']
    wf_name = wf_config['name']

    req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{wf_id}', headers={'X-N8N-API-KEY': N8N_KEY})
    with urllib.request.urlopen(req) as r:
        wf = json.loads(r.read())

    # Add Return Success Code node
    return_id = str(uuid.uuid4())
    return_node = {
        "id": return_id,
        "name": "Return Success",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": wf_config['return_pos'],
        "parameters": {
            "jsCode": wf_config['return_code']
        }
    }
    wf['nodes'].append(return_node)
    print(f'Added Return Success node to {wf_name}')

    conns = wf['connections']

    # Restart Server -> [Progress: Done (parallel), Return Success (direct)]
    conns[wf_config['restart_node']] = {
        "main": [[
            {"node": "Progress: Done",    "type": "main", "index": 0},
            {"node": "Return Success",    "type": "main", "index": 0}
        ]]
    }
    # Progress: Done has no outgoing (already set)
    conns['Progress: Done'] = {"main": [[]]}
    # Return Success has no outgoing
    conns['Return Success'] = {"main": [[]]}
    print(f'Restart Server -> [Progress: Done (parallel), Return Success (direct)]')

    update_payload = {
        "name": wf['name'], "nodes": wf['nodes'], "connections": conns,
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
            # Verify Return Success node exists
            node_names = [n['name'] for n in result['nodes']]
            print(f'{wf_name} nodes: {node_names}')
            print(f'{wf_name} updated!')
    except urllib.error.HTTPError as e:
        print(f'ERROR {wf_name}: {e.code} {e.read().decode()[:400]}')
    print()

print('Both workflows updated with Return Success node!')
