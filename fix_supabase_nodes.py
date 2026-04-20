import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
CRED_SB = '5UN2S3jIQ9dGyWoa'

# Fields that exist in server_mods (without mod_type)
SAFE_FIELDS = [
    {"fieldId": "server_id", "fieldValue": "={{ $json.server_id }}"},
    {"fieldId": "mod_name", "fieldValue": "={{ $json.mod_name }}"},
    {"fieldId": "mod_id", "fieldValue": "={{ $json.mod_id }}"},
    {"fieldId": "source", "fieldValue": "={{ $json.source }}"},
    {"fieldId": "status", "fieldValue": "={{ $json.status }}"}
]

def fix_supabase_node(wf_id, wf_name, supabase_node_name, server_id_expr, mod_name_expr, mod_id_expr):
    req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{wf_id}', headers={'X-N8N-API-KEY': N8N_KEY})
    with urllib.request.urlopen(req) as r:
        wf = json.loads(r.read())

    for node in wf['nodes']:
        if node.get('name') == supabase_node_name:
            node['parameters'] = {
                "operation": "create",
                "tableId": "server_mods",
                "fieldsUi": {"fieldValues": [
                    {"fieldId": "server_id", "fieldValue": server_id_expr},
                    {"fieldId": "mod_name", "fieldValue": mod_name_expr},
                    {"fieldId": "mod_id", "fieldValue": mod_id_expr},
                    {"fieldId": "source", "fieldValue": "curseforge"},
                    {"fieldId": "status", "fieldValue": "installed"}
                ]}
            }
            node['credentials'] = {"supabaseApi": {"id": CRED_SB, "name": "Supabase account 2"}}
            print(f'  Fixed {supabase_node_name} in {wf_name}: removed mod_type, using correct exprs')

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
            print(f'  {wf_name} Supabase node fixed!')
    except urllib.error.HTTPError as e:
        print(f'  ERROR: {e.code} {e.read().decode()[:300]}')

print('Fixing INSTALL_PLUGIN Supabase node...')
# INSTALL_PLUGIN: Supabase Insert Plugin gets data from Split for DB
# Split for DB outputs: {server_id, mod_name, mod_id, source, status, mod_type}
# But server_mods.server_id needs $json.server_id etc.
fix_supabase_node(
    wf_id='c4Be1nEBsCbXNOgQ',
    wf_name='INSTALL_PLUGIN',
    supabase_node_name='Supabase Insert Plugin',
    server_id_expr='={{ $json.server_id }}',
    mod_name_expr='={{ $json.mod_name }}',
    mod_id_expr='={{ $json.mod_id }}'
)

print('\nFixing INSTALL_MODPACK Supabase node...')
# INSTALL_MODPACK: Save Modpack to Supabase gets data from Build Install Script via SSH
fix_supabase_node(
    wf_id='dlSgSptMPFIHdIC6',
    wf_name='INSTALL_MODPACK',
    supabase_node_name='Save Modpack to Supabase',
    server_id_expr="={{ $('Build Install Script').first().json.server_id }}",
    mod_name_expr="={{ $('Build Install Script').first().json.modpack_name }}",
    mod_id_expr="={{ String($('Build Install Script').first().json.modpack_id) }}"
)

print('\nDone. mod_type removed from both workflows to match existing table schema.')
print('NOTE: Add mod_type column to server_mods in Supabase dashboard later:')
print("  ALTER TABLE server_mods ADD COLUMN IF NOT EXISTS mod_type text DEFAULT 'mod';")
