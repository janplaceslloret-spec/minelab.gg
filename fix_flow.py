import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'

def fix_workflow(wf_id, wf_name, script_node, ssh_node, progress_install_node, supabase_node, progress_restart_node, restart_node, progress_done_node, script_expr):
    """
    Fix the flow so that Progress: Installing is a PARALLEL branch from script_node,
    not a sequential blocker before SSH. Also fix SSH command to use explicit reference.

    Correct flow:
    script_node → [Progress: Installing (parallel), SSH (direct)]
    SSH → [supabase_node]
    supabase_node → [Progress: Restarting (parallel), Restart (direct)]
    Restart → Progress: Done
    """
    req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{wf_id}', headers={'X-N8N-API-KEY': N8N_KEY})
    with urllib.request.urlopen(req) as r:
        wf = json.loads(r.read())

    conns = wf['connections']

    # Fix SSH node command to use explicit node reference
    for node in wf['nodes']:
        if node.get('name') == ssh_node:
            node['parameters']['command'] = f"={{ $('{script_node}').first().json.script }}"
            print(f'  Fixed {ssh_node} command to use $(\'{script_node}\')')

    # Rebuild connections for the install chain:
    # script_node → Progress: Installing (parallel side branch)
    # script_node → SSH (direct, gets $json from script_node)
    conns[script_node] = {
        "main": [[
            {"node": progress_install_node, "type": "main", "index": 0},
            {"node": ssh_node, "type": "main", "index": 0}
        ]]
    }
    print(f'  {script_node} -> [{progress_install_node}, {ssh_node}] (parallel)')

    # Progress: Installing has no outgoing connection (it's a side branch)
    conns[progress_install_node] = {"main": [[]]}

    # SSH -> supabase
    conns[ssh_node] = {"main": [[{"node": supabase_node, "type": "main", "index": 0}]]}
    print(f'  {ssh_node} -> {supabase_node}')

    # supabase → Progress: Restarting (parallel) + Restart (direct)
    conns[supabase_node] = {
        "main": [[
            {"node": progress_restart_node, "type": "main", "index": 0},
            {"node": restart_node, "type": "main", "index": 0}
        ]]
    }
    print(f'  {supabase_node} -> [{progress_restart_node}, {restart_node}] (parallel)')

    # Progress: Restarting has no outgoing connection
    conns[progress_restart_node] = {"main": [[]]}

    # Restart -> Progress: Done
    conns[restart_node] = {"main": [[{"node": progress_done_node, "type": "main", "index": 0}]]}
    print(f'  {restart_node} -> {progress_done_node}')

    # Progress: Done has no outgoing connection
    conns[progress_done_node] = {"main": [[]]}

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
            print(f'  {wf_name} connections fixed!')
    except urllib.error.HTTPError as e:
        print(f'  ERROR: {e.code} {e.read().decode()[:300]}')

# Fix INSTALL_PLUGIN
print('Fixing INSTALL_PLUGIN...')
fix_workflow(
    wf_id='c4Be1nEBsCbXNOgQ',
    wf_name='INSTALL_PLUGIN',
    script_node='Build Plugin Script',
    ssh_node='SSH Install Plugins',
    progress_install_node='Progress: Installing',
    supabase_node='Supabase Insert Plugin',
    progress_restart_node='Progress: Restarting',
    restart_node='Restart Server',
    progress_done_node='Progress: Done',
    script_expr="$('Build Plugin Script').first().json.script"
)

# Fix INSTALL_MODPACK
print('\nFixing INSTALL_MODPACK...')
fix_workflow(
    wf_id='dlSgSptMPFIHdIC6',
    wf_name='INSTALL_MODPACK',
    script_node='Build Install Script',
    ssh_node='SSH Install Modpack',
    progress_install_node='Progress: Installing',
    supabase_node='Save Modpack to Supabase',
    progress_restart_node='Progress: Restarting',
    restart_node='Restart Server',
    progress_done_node='Progress: Done',
    script_expr="$('Build Install Script').first().json.script"
)

print('\nDone! Both workflows use parallel Progress branches now.')
print('SSH nodes use explicit node references instead of $json.script')
