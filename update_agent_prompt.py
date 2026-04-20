import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
SM_ID = 'FafyAxLWGxmSnTJu'

# New sections to append to the existing system prompt
NEW_SECTIONS = """

---

INSTALACIÓN DE PLUGINS (solo Paper)

Si el usuario pide instalar un plugin → usa INSTALL_PLUGIN

⚠️ REGLA: Los plugins solo funcionan en servidores Paper. Si el servidor es Fabric, Forge o Vanilla → informa al usuario y NO uses la tool.

Parámetros EXACTOS:
{
  "server_id": "<serverID del contexto>",
  "mods": "NombrePlugin1, NombrePlugin2"
}

Ejemplos de frases que activan INSTALL_PLUGIN:
- "instala EssentialsX"
- "pon WorldGuard y WorldEdit"
- "quiero el plugin de economía"
- "añade LuckPerms"

✓ Correcto: "EssentialsX, WorldGuard"
✗ Incorrecto: usar INSTALL_MODS para plugins

---

INSTALACIÓN DE MODPACKS (solo Fabric / Forge / NeoForge)

Si el usuario pide instalar un modpack → usa INSTALL_MODPACK

⚠️ REGLA: Los modpacks solo funcionan en servidores Fabric, Forge o NeoForge. Si el servidor es Paper o Vanilla → informa al usuario y NO uses la tool.

⚠️ AVISO IMPORTANTE: Instalar un modpack BORRA todos los mods actuales de /mods/ y los reemplaza por los del modpack. Informa al usuario antes de ejecutar si tiene mods instalados.

Parámetros EXACTOS:
{
  "server_id": "<serverID del contexto>",
  "mods": "Nombre del Modpack"
}

Ejemplos de frases que activan INSTALL_MODPACK:
- "instala el modpack Better MC"
- "pon All The Mods 9"
- "quiero el modpack de RLCraft"
- "instala un modpack de tecnología"

✓ Correcto: "Better MC" / "All The Mods 9"
✗ Incorrecto: pasar una lista de mods individuales a INSTALL_MODPACK

---

TABLA ACTUALIZADA DE TOOLS OBLIGATORIAS

| Usuario dice / pide               | Tool OBLIGATORIA   |
|-----------------------------------|--------------------|
| no arranca / error / crash / lag  | DIAGNOSE_AND_FIX   |
| instalar mod                      | INSTALL_MODS       |
| instalar plugin                   | INSTALL_PLUGIN     |
| instalar modpack                  | INSTALL_MODPACK    |
| ejecutar comando                  | CONSOLA            |
| cambiar versión / software        | CHANGE_VERSION     |
| cambiar config / server.properties| UPDATE_SERVER_CONFIG|
| borrar mundo                      | DELETE_WORLD       |
| desinstalar mod                   | UNINSTALL_MOD      |
"""

# Fetch current workflow
req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{SM_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

# Find agent node
agent_node = next((n for n in wf['nodes'] if n.get('type') == '@n8n/n8n-nodes-langchain.agent'), None)
if not agent_node:
    print('ERROR: Agent node not found')
    exit(1)

current_sm = agent_node['parameters']['options']['systemMessage']

# Check if already updated
if 'INSTALL_PLUGIN' in current_sm and 'INSTALL_MODPACK' in current_sm:
    print('Prompt already contains INSTALL_PLUGIN and INSTALL_MODPACK - updating anyway to ensure latest version')

# Replace the tool table section with the new one, then append new sections
# Find and remove old table if exists
import re
# Remove old table (between "REGLA CRÍTICA — USO OBLIGATORIO" table and next ---)
# Instead, append new sections before the SEGURIDAD section
SEGURIDAD_MARKER = '\n---\n\nSEGURIDAD'
if SEGURIDAD_MARKER in current_sm:
    idx = current_sm.index(SEGURIDAD_MARKER)
    new_sm = current_sm[:idx] + NEW_SECTIONS + current_sm[idx:]
else:
    new_sm = current_sm + NEW_SECTIONS

agent_node['parameters']['options']['systemMessage'] = new_sm

# Update workflow
update_payload = {
    "name": wf['name'],
    "nodes": wf['nodes'],
    "connections": wf['connections'],
    "settings": wf.get('settings', {}),
    "staticData": wf.get('staticData')
}
data = json.dumps(update_payload).encode()
req2 = urllib.request.Request(
    f'{N8N_BASE}/api/v1/workflows/{SM_ID}',
    data=data,
    headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json'},
    method='PUT'
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        print(f'SUCCESS: SERVER MANAGER prompt updated')
        print(f'New prompt length: {len(new_sm)} chars')
        # Verify
        for n in result['nodes']:
            if n.get('type') == '@n8n/n8n-nodes-langchain.agent':
                sm = n['parameters']['options']['systemMessage']
                has_plugin = 'INSTALL_PLUGIN' in sm
                has_modpack = 'INSTALL_MODPACK' in sm
                print(f'INSTALL_PLUGIN in prompt: {has_plugin}')
                print(f'INSTALL_MODPACK in prompt: {has_modpack}')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:300]}')
