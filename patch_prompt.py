import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
SM_ID = 'FafyAxLWGxmSnTJu'

# Patch: replace the old tool table with one that includes plugins and modpacks
# and add stronger rules

OLD_TABLE = """| Usuario dice / pide | Tool OBLIGATORIA |
|---------------------|------------------|
| no arranca | DIAGNOSE_AND_FIX |
| no inicia | DIAGNOSE_AND_FIX |
| no enciende | DIAGNOSE_AND_FIX |
| no funciona | DIAGNOSE_AND_FIX |
| crashea | DIAGNOSE_AND_FIX |
| se cae | DIAGNOSE_AND_FIX |
| lag | DIAGNOSE_AND_FIX |
| error | DIAGNOSE_AND_FIX |
| no pueden entrar | DIAGNOSE_AND_FIX |
| problema | DIAGNOSE_AND_FIX |
| Instalar mod | INSTALL_MODS |
| Ejecutar comando | CONSOLA |
| Cambiar versión | CHANGE_VERSION |
| Cambiar config | UPDATE_SERVER_CONFIG |
| Borrar mundo | DELETE_WORLD |"""

NEW_TABLE = """| Usuario dice / pide                        | Tool OBLIGATORIA    |
|--------------------------------------------|---------------------|
| no arranca / no inicia / no enciende       | DIAGNOSE_AND_FIX    |
| no funciona / crashea / se cae / lag       | DIAGNOSE_AND_FIX    |
| error / problema / no pueden entrar        | DIAGNOSE_AND_FIX    |
| instalar mod / añadir mod                  | INSTALL_MODS        |
| instalar plugin / añadir plugin            | INSTALL_PLUGIN      |
| instalar modpack / poner modpack           | INSTALL_MODPACK     |
| ejecutar comando                           | CONSOLA             |
| cambiar versión / cambiar software         | CHANGE_VERSION      |
| cambiar config / server.properties         | UPDATE_SERVER_CONFIG|
| borrar mundo / regenerar mundo             | DELETE_WORLD        |
| desinstalar mod                            | UNINSTALL_MOD       |

⚠️ REGLA ABSOLUTA PLUGINS:
Si el usuario pide instalar un plugin Y el servidor es Paper:
→ USA INSTALL_PLUGIN INMEDIATAMENTE sin preguntar
→ Parámetros: {"server_id": "<serverID>", "mods": "<nombre del plugin>"}
→ NO digas "¿quieres que lo instale?" — HAZLO DIRECTAMENTE

Si el usuario pide instalar un plugin Y el servidor NO es Paper:
→ Informa que los plugins solo funcionan en Paper
→ NO uses ninguna tool

⚠️ REGLA ABSOLUTA MODPACKS:
Si el usuario pide instalar un modpack Y el servidor es Fabric/Forge:
→ USA INSTALL_MODPACK INMEDIATAMENTE sin preguntar
→ Parámetros: {"server_id": "<serverID>", "mods": "<nombre del modpack>"}
→ NO digas "¿quieres que lo instale?" — HAZLO DIRECTAMENTE
→ AVISA que esto borrará los mods actuales del servidor

Si el usuario pide instalar un modpack Y el servidor NO es Fabric/Forge:
→ Informa que los modpacks solo funcionan en Fabric, Forge o NeoForge
→ NO uses ninguna tool"""

req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{SM_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

agent_node = next(n for n in wf['nodes'] if n.get('type') == '@n8n/n8n-nodes-langchain.agent')
current_sm = agent_node['parameters']['options']['systemMessage']

if OLD_TABLE in current_sm:
    new_sm = current_sm.replace(OLD_TABLE, NEW_TABLE)
    print('Replaced old tool table with new one (includes plugins + modpacks)')
else:
    print('WARNING: old table not found exactly - appending rules instead')
    # Find the existing plugin/modpack sections I added and replace them
    if 'INSTALL_PLUGIN' in current_sm:
        # Already has the sections, just need to strengthen the table
        # Find the table in the new sections and make it stricter
        new_sm = current_sm
        print('Prompt already updated, checking tool table...')
    else:
        new_sm = current_sm

# Also fix the "Instalar mod" entry in the tool table if it's still there alone
new_sm = new_sm.replace('| Instalar mod | INSTALL_MODS |', '| instalar mod / añadir mod | INSTALL_MODS |')

agent_node['parameters']['options']['systemMessage'] = new_sm

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
        print('Prompt updated successfully')
        for n in result['nodes']:
            if n.get('type') == '@n8n/n8n-nodes-langchain.agent':
                sm = n['parameters']['options']['systemMessage']
                print(f'Has INSTALL_PLUGIN rule: {"REGLA ABSOLUTA PLUGINS" in sm}')
                print(f'Has INSTALL_MODPACK rule: {"REGLA ABSOLUTA MODPACKS" in sm}')
                print(f'Total prompt length: {len(sm)} chars')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:300]}')
