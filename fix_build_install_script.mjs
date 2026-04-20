import { createClient } from '@supabase/supabase-js';

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'https://snack55-n8n1.q7pa8v.easypanel.host';
const WF_ID = 'dlSgSptMPFIHdIC6';

// The corrected code for Build Install Script node
// Using String.raw to avoid template literal escaping issues
const FIXED_CODE = String.raw`const filesData = $input.first().json.data||[];
const ctx = $('Parse Manifest').first().json;
const serverId = ctx.server_id;
const modsPath = ` + '`' + `/opt/minecraft/servers/\${serverId}/mods` + '`' + `;

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

const wgets = downloadable.map(f=>` + '`' + `wget -q -P "\${modsPath}" "\${f.downloadUrl}" && echo "OK: \${f.fileName}" || echo "FAIL: \${f.fileName}"` + '`' + `).join('\\n');
const script = [
  ` + '`' + `rm -rf "\${modsPath}" && mkdir -p "\${modsPath}"` + '`' + `,
  wgets
].join('\\n');

return [{json:{
  server_id: serverId,
  modpack_name: ctx.modpack_name,
  modpack_id: ctx.modpack_id,
  mc_version: ctx.mc_version,
  mod_count: downloadable.length,
  skipped_count: noUrl.length + clientSkipped.length,
  client_mods_skipped: clientSkipped.length,
  script,
  message: ` + '`' + `Modpack \${ctx.modpack_name} instalado con \${downloadable.length} mods` + '`' + `
}}];`;

async function main() {
  // Fetch workflow
  const getResp = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    headers: { 'X-N8N-API-KEY': N8N_KEY }
  });
  const wf = await getResp.json();
  console.log('Fetched workflow:', wf.name);

  // Find and fix the node
  let fixed = false;
  for (const node of wf.nodes) {
    if (node.name === 'Build Install Script') {
      console.log('Found node. Current code preview:', node.parameters.jsCode?.substring(0, 60));
      node.parameters.jsCode = FIXED_CODE;
      fixed = true;
      console.log('Code replaced. Preview:', FIXED_CODE.substring(0, 80));
      break;
    }
  }

  if (!fixed) {
    console.error('ERROR: Node not found!');
    process.exit(1);
  }

  // Update workflow
  const updatePayload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData
  };

  const putResp = await fetch(`${N8N_BASE}/api/v1/workflows/${WF_ID}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload)
  });

  if (!putResp.ok) {
    const err = await putResp.text();
    console.error('PUT failed:', putResp.status, err.substring(0, 400));
    process.exit(1);
  }

  const result = await putResp.json();
  for (const n of result.nodes) {
    if (n.name === 'Build Install Script') {
      console.log('Saved OK. Code preview:', n.parameters.jsCode?.substring(0, 100));
    }
  }
  console.log('Done!');
}

main().catch(console.error);
