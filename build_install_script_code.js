const filesData = $input.first().json.data||[];
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
}}];
