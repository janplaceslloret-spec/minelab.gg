import json, urllib.request, urllib.error

N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY'
N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host'
WF_ID = 'dlSgSptMPFIHdIC6'

# The corrected code for Build Install Script node
FIXED_CODE = r"""const filesData = $input.first().json.data||[];
const ctx = $('Parse Manifest').first().json;
const serverId = ctx.server_id;
const modsPath = `/opt/minecraft/servers/${serverId}/mods`;

// Filtrar mods solo-cliente que crashean servidores dedicados
const CLIENT_ONLY = [
  /oculus/i, /mekalus/i, /embeddium/i, /rubidium/i,
  /sodiumdynamiclights/i, /sodiumoptionsapi/i,
  /colorwheel/i, /crashassistant/i, /crashutilities/i,
  /modelfix/i, /optifine/i, /optifabric/i,
  /^iris-/i
];
const isClientOnly = (f) => CLIENT_ONLY.some(p => p.test(f.fileName||''));
const serverFiles = filesData.filter(f => !isClientOnly(f));
const clientSkipped = filesData.filter(f => isClientOnly(f));

const downloadable = serverFiles.filter(f=>f.downloadUrl);
const noUrl = serverFiles.filter(f=>!f.downloadUrl);
if (downloadable.length===0) throw new Error('Ningun mod tiene URL de descarga directa en CurseForge');

const wgets = downloadable.map(f=>`wget -q -P "${modsPath}" "${f.downloadUrl}" && echo "OK: ${f.fileName}" || echo "FAIL: ${f.fileName}"`).join('\n');
const script = [
  `rm -rf "${modsPath}" && mkdir -p "${modsPath}"`,
  wgets
].join('\n');

return [{json:{
  server_id: serverId,
  modpack_name: ctx.modpack_name,
  modpack_id: ctx.modpack_id,
  mc_version: ctx.mc_version,
  mod_count: downloadable.length,
  skipped_count: noUrl.length + clientSkipped.length,
  client_mods_skipped: clientSkipped.length,
  script,
  message: `Modpack ${ctx.modpack_name} instalado con ${downloadable.length} mods`
}}];"""

# Fetch workflow
req = urllib.request.Request(f'{N8N_BASE}/api/v1/workflows/{WF_ID}', headers={'X-N8N-API-KEY': N8N_KEY})
with urllib.request.urlopen(req) as r:
    wf = json.loads(r.read())

# Fix the Build Install Script node
fixed = False
for node in wf['nodes']:
    if node.get('name') == 'Build Install Script':
        print(f"Found node. Current code preview: {node['parameters'].get('jsCode','')[:80]}")
        node['parameters']['jsCode'] = FIXED_CODE
        fixed = True
        print("Code replaced.")
        break

if not fixed:
    print("ERROR: Node 'Build Install Script' not found!")
    exit(1)

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
    f'{N8N_BASE}/api/v1/workflows/{WF_ID}', data=data,
    headers={'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json'}, method='PUT'
)
try:
    with urllib.request.urlopen(req2) as r:
        result = json.loads(r.read())
        for n in result['nodes']:
            if n['name'] == 'Build Install Script':
                preview = n['parameters'].get('jsCode', '')[:100]
                print(f"Saved. Code preview: {preview}")
        print('Done!')
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code} {e.read().decode()[:400]}')
