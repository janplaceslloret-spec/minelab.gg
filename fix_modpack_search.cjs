const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'snack55-n8n1.q7pa8v.easypanel.host';
const WF_ID = 'dlSgSptMPFIHdIC6';

// Fixed Pick modpack file:
// 1. Don't fall back to results[0] when no name match — throw instead
// 2. Don't use incompatible MC version files — throw instead
const NEW_PICK_CODE = `const results = $json.data||[];
const ctx = $('Validate loader').first().json;
const mpName = ctx.modpack_name.toLowerCase();
const mcVersion = ctx.mc_version;
if (results.length===0) throw new Error('Modpack "'+ctx.modpack_name+'" no encontrado en CurseForge');

// 1. Exact name or slug match
let best = results.find(m=>m.name.toLowerCase()===mpName||(m.slug||'').toLowerCase()===mpName);
// 2. Partial match (query inside name or vice versa)
if (!best) best = results.find(m=>m.name.toLowerCase().includes(mpName)||mpName.includes(m.name.toLowerCase()));
// 3. Word overlap (at least half of query words appear in the modpack name)
if (!best) {
  const words = mpName.split(/\\s+/).filter(w=>w.length>2);
  if (words.length>0) {
    best = results.find(m=>{
      const mn = m.name.toLowerCase();
      const matches = words.filter(w=>mn.includes(w)).length;
      return matches >= Math.ceil(words.length/2);
    });
  }
}
// 4. No match → error with suggestions
if (!best) throw new Error('No encontré el modpack "'+ctx.modpack_name+'". ¿Quisiste decir alguno de estos? '+results.slice(0,5).map(m=>m.name).join(', '));

const files = (best.latestFiles||[]);

// Filter by MC version — STRICT (no fallback to incompatible versions)
let compatFiles = files.filter(f=>(f.gameVersions||[]).some(v=>v===mcVersion));
if (compatFiles.length===0) {
  const available = [...new Set(files.flatMap(f=>f.gameVersions||[]).filter(v=>/^\\d+\\.\\d+/.test(v)))].sort().join(', ');
  throw new Error('El modpack "'+best.name+'" no está disponible para Minecraft '+mcVersion+'. Versiones disponibles: '+(available||'desconocidas'));
}
compatFiles.sort((a,b)=>new Date(b.fileDate)-new Date(a.fileDate));
const file = compatFiles[0];
if (!file) throw new Error('Sin archivos compatibles para '+best.name+' '+mcVersion);

return [{json:{
  server_id: ctx.server_id,
  mc_version: ctx.mc_version,
  server_type: ctx.server_type,
  modpack_name: best.name,
  modpack_id: best.id,
  file_id: file.id,
  file_name: file.fileName,
  download_url: file.downloadUrl
}}];`;

// Fixed Parse Manifest: validate manifest MC version matches server mc_version
const NEW_PARSE_MANIFEST_CODE = `const raw = ($json.stdout||'').trim();
if (raw.startsWith('ERROR:')) throw new Error('Error al descargar modpack: '+raw);
let manifest;
try { manifest = JSON.parse(raw); } catch(e) { throw new Error('manifest.json invalido: '+e.message); }

const ctx = $('Pick modpack file').first().json;

// Validate MC version from manifest matches server version
const manifestMcVersion = manifest.minecraft?.version;
if (manifestMcVersion && manifestMcVersion !== ctx.mc_version) {
  throw new Error(
    '❌ Incompatibilidad de versión: el modpack "'+manifest.name+'" es para Minecraft '+manifestMcVersion+
    ', pero tu servidor está configurado para '+ctx.mc_version+
    '. Cambia la versión de tu servidor o elige un modpack compatible.'
  );
}

const files = (manifest.files||[]).filter(f=>f.required!==false);
const fileIds = files.map(f=>f.fileID);
return [{json:{
  server_id: ctx.server_id,
  mc_version: ctx.mc_version,
  modpack_name: ctx.modpack_name,
  file_name: ctx.file_name,
  modpack_id: ctx.modpack_id,
  file_ids: fileIds,
  mod_count: fileIds.length,
  files_raw: files
}}];`;

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: N8N_BASE, path, method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('Fetching INSTALL_MODPACK workflow...');
  const r = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  const wf = r.body;
  console.log('Workflow:', wf.name, '| Nodes:', wf.nodes.length);

  let fixed = 0;
  for (const node of wf.nodes) {
    if (node.name === 'Pick modpack file') {
      node.parameters.jsCode = NEW_PICK_CODE;
      console.log('✓ Fixed: Pick modpack file');
      fixed++;
    }
    if (node.name === 'Parse Manifest') {
      node.parameters.jsCode = NEW_PARSE_MANIFEST_CODE;
      console.log('✓ Fixed: Parse Manifest (added version validation)');
      fixed++;
    }
  }

  if (fixed === 0) { console.log('No nodes found to fix!'); return; }

  console.log(`Saving ${fixed} fixed nodes...`);
  const res = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, {
    name: wf.name, nodes: wf.nodes, connections: wf.connections,
    settings: wf.settings || {}, staticData: wf.staticData || null
  });

  if (res.status > 201) {
    console.error('PUT failed:', res.status, JSON.stringify(res.body).substring(0, 300));
    return;
  }

  // Verify
  for (const node of res.body.nodes) {
    if (node.name === 'Pick modpack file') {
      const hasStrict = node.parameters.jsCode.includes('No encontré el modpack');
      const hasVersionCheck = node.parameters.jsCode.includes('no está disponible para Minecraft');
      console.log(`✓ Pick modpack file: strict_name=${hasStrict}, strict_version=${hasVersionCheck}`);
    }
    if (node.name === 'Parse Manifest') {
      const hasValidation = node.parameters.jsCode.includes('Incompatibilidad de versión');
      console.log(`✓ Parse Manifest: version_validation=${hasValidation}`);
    }
  }
  console.log('Done!');
}

main().catch(e => console.error('FATAL:', e.message));
