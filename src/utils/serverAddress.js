// Devuelve la dirección de conexión amigable de un servidor MC.
// Si tiene slug → "<slug>.minelab.gg" (DNS SRV resuelve el puerto).
// Si no → fallback al IP:puerto numérico (servers viejos antes del backfill).
export function getServerAddress(server) {
  if (!server) return 'IP PENDIENTE';
  if (server.slug) return `${server.slug}.minelab.gg`;
  if (server.ip && server.port) return `${server.ip}:${server.port}`;
  return 'IP PENDIENTE';
}
