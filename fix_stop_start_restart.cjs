const https = require('https');

const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZmY4ZTBmMi1lN2FiLTRjNWQtYWYyMi1hODRkZWQ1YzVkNWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc2NjA5MjcxLCJleHAiOjE3NzkxNjMyMDB9.zJ47gp_45M9Q2gkHgVi9AVLPZTLDKB6akgUxXxBMSTY';
const N8N_BASE = 'snack55-n8n1.q7pa8v.easypanel.host';
const WF_ID = 'xCurICBJWO44Zs7p';

// ─── Helper: kill all Java procs in a server directory ───────────────────────
// Used both in stop and start scripts to prevent orphan processes
const KILL_ORPHANS_FN = `
kill_java_in_dir() {
  local DIR="$1"
  local killed=0
  for pid in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$'); do
    [ -L "/proc/$pid/cwd" ] || continue
    local cwd
    cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null) || continue
    [[ "$cwd" == "$DIR"* ]] || continue
    cat /proc/$pid/cmdline 2>/dev/null | tr '\\0' ' ' | grep -qi java || continue
    echo "  Matando Java PID $pid (cwd=$cwd)"
    kill -15 "$pid" 2>/dev/null || true
    killed=$((killed+1))
  done
  if [ $killed -gt 0 ]; then
    sleep 4
    # Force kill if still alive
    for pid in $(ls /proc 2>/dev/null | grep -E '^[0-9]+$'); do
      [ -L "/proc/$pid/cwd" ] || continue
      local cwd
      cwd=$(readlink "/proc/$pid/cwd" 2>/dev/null) || continue
      [[ "$cwd" == "$DIR"* ]] || continue
      cat /proc/$pid/cmdline 2>/dev/null | tr '\\0' ' ' | grep -qi java || continue
      echo "  Force kill PID $pid"
      kill -9 "$pid" 2>/dev/null || true
    done
    sleep 1
  fi
  echo "  Procesos Java eliminados: $killed"
}
`;

// ─── STOP script ─────────────────────────────────────────────────────────────
// Graceful shutdown: stop cmd → wait 60s → kill orphans → clear locks
const STOP_SCRIPT = `=SERVER="{{ $('Edit Fields').item.json.server }}"
BASE="/opt/minecraft/servers/$SERVER"

echo "=== STOP: $SERVER ==="
${KILL_ORPHANS_FN}

# 1. Enviar stop graceful si el screen existe
if screen -list | grep -q "[.]$SERVER[[:space:]]"; then
  echo "Enviando comando stop..."
  screen -S "$SERVER" -X stuff "stop\\n"

  # Esperar hasta 60s que el proceso termine
  for i in $(seq 1 30); do
    sleep 2
    if ! screen -list | grep -q "[.]$SERVER[[:space:]]"; then
      echo "Servidor parado gracefully en $((i*2))s"
      break
    fi
  done
else
  echo "No hay screen activo para $SERVER"
fi

# 2. Matar cualquier Java que siga corriendo en este directorio
echo "Buscando procesos Java huerfanos..."
kill_java_in_dir "$BASE"

# 3. Matar screen si sigue vivo
screen -S "$SERVER" -X quit 2>/dev/null || true

# 4. Limpiar session.lock
find "$BASE" -name "session.lock" -delete && echo "session.lock limpiados" || true

echo "SERVER_STOPPED"`;

// ─── START script ────────────────────────────────────────────────────────────
// Kills orphan Java + clears session.lock BEFORE starting new instance
const START_SCRIPT = `=cd /opt/minecraft/servers/{{ $('Edit Fields').item.json.server }} || exit 1

SERVER_NAME="{{ $('Edit Fields').item.json.server }}"
RAM_GB="{{ $('Edit Fields').item.json.ram }}"
BASE="$(pwd)"

LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/startup.log"
mkdir -p "$LOG_DIR"

echo "=== START: $SERVER_NAME ==="
echo "RAM: \${RAM_GB}G"

${KILL_ORPHANS_FN}

# ── 1. Matar procesos Java huerfanos de sesiones anteriores ──────────────────
echo "Limpiando procesos Java huerfanos..."
kill_java_in_dir "$BASE"

# ── 2. Cerrar screen previa ──────────────────────────────────────────────────
if screen -list | grep -q "[.]$SERVER_NAME[[:space:]]"; then
  echo "Cerrando screen previa..."
  screen -S "$SERVER_NAME" -X quit 2>/dev/null || true
  sleep 1
fi

# ── 3. Limpiar session.lock ───────────────────────────────────────────────────
find "$BASE" -name "session.lock" -delete && echo "session.lock limpiados" || true

# ── 4. EULA ───────────────────────────────────────────────────────────────────
if [[ -f eula.txt ]]; then
  sed -i 's/^eula=.*/eula=true/' eula.txt
else
  echo "eula=true" > eula.txt
fi

# ── 5. run.sh (Forge/NeoForge) ────────────────────────────────────────────────
if [[ -f run.sh ]]; then
  echo "Usando run.sh (Forge/NeoForge)"
  chmod +x run.sh 2>/dev/null || true

  if [[ -f user_jvm_args.txt ]]; then
    sed -i "s/-Xmx[0-9]*[GgMm]/-Xmx\${RAM_GB}G/" user_jvm_args.txt
    sed -i "s/-Xms[0-9]*[GgMm]/-Xms\${RAM_GB}G/" user_jvm_args.txt
  fi

  : > "$LOG_FILE"
  screen -L -Logfile "$LOG_FILE" -dmS "$SERVER_NAME" bash -c "cd '$BASE' && ./run.sh"

  sleep 4
  if screen -list | grep -q "[.]$SERVER_NAME[[:space:]]"; then
    echo "OK: servidor iniciado con run.sh"
    exit 0
  fi
  echo "ERROR: run.sh falló"
  tail -n 40 "$LOG_FILE" 2>/dev/null || true
  exit 1
fi

# ── 6. Detectar jar ───────────────────────────────────────────────────────────
JAR=""
if [[ -f fabric-server-launch.jar ]]; then
  JAR="fabric-server-launch.jar"
elif [[ -f server.jar ]]; then
  JAR="server.jar"
else
  JAR="$(ls *.jar 2>/dev/null | grep -viE 'installer|client|libraries' | head -n1)"
fi

if [[ -z "$JAR" ]]; then
  echo "ERROR: No se encontró jar ejecutable"
  exit 1
fi
echo "Jar detectado: $JAR"

EXTRA_FLAGS=""
if [[ "$JAR" == forge-* ]]; then
  EXTRA_FLAGS="-Dfml.queryResult=confirm"
fi

# ── 7. Función de arranque con Java ──────────────────────────────────────────
start_with_java() {
  local JAVA_BIN="$1"
  local JAVA_HOME_BIN
  JAVA_HOME_BIN="$(dirname "$(dirname "$JAVA_BIN")")"

  if [[ ! -x "$JAVA_BIN" ]]; then
    echo "Java no disponible: $JAVA_BIN"
    return 1
  fi

  echo "Probando con Java: $JAVA_BIN"
  : > "$LOG_FILE"

  screen -L -Logfile "$LOG_FILE" -dmS "$SERVER_NAME" bash -lc "
    cd \\"$BASE\\" || exit 1
    export JAVA_HOME=\\"$JAVA_HOME_BIN\\"
    export PATH=\\"$JAVA_HOME_BIN/bin:\\$PATH\\"
    echo '===== START \\$(date) ====='
    exec \\"$JAVA_BIN\\" $EXTRA_FLAGS -Xms\${RAM_GB}G -Xmx\${RAM_GB}G -jar \\"$JAR\\" nogui
  "

  sleep 4
  if screen -list | grep -q "[.]$SERVER_NAME[[:space:]]"; then
    echo "OK: servidor iniciado con $JAVA_BIN"
    return 0
  fi

  echo "El proceso salió al arrancar con $JAVA_BIN"
  tail -n 40 "$LOG_FILE" 2>/dev/null || true
  return 1
}

JAVA_CANDIDATES=(
  "/usr/lib/jvm/java-25-openjdk-amd64/bin/java"
  "/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
  "/usr/lib/jvm/java-17-openjdk-amd64/bin/java"
  "/usr/lib/jvm/java-8-openjdk-amd64/bin/java"
)

for JAVA_BIN in "\${JAVA_CANDIDATES[@]}"; do
  if start_with_java "$JAVA_BIN"; then
    exit 0
  fi
  screen -S "$SERVER_NAME" -X quit 2>/dev/null || true
  sleep 1
done

echo "ERROR: No arrancó con ninguna versión de Java"
exit 1`;

// ─── RESTART script ──────────────────────────────────────────────────────────
// Graceful stop (like stop script) → clear locks → start (like start script)
const RESTART_SCRIPT = `=cd /opt/minecraft/servers/{{ $('Edit Fields').item.json.server }} || exit 1

SERVER="{{ $('Edit Fields').item.json.server }}"
RAM="{{ $('Edit Fields').item.json.ram }}"
MC_VERSION="{{ $('Edit Fields').item.json.version }}"
BASE="$(pwd)"
LOG_FILE="./logs/startup.log"
mkdir -p ./logs

echo "=== RESTART: $SERVER ==="
${KILL_ORPHANS_FN}

# ── FASE 1: STOP GRACEFUL ────────────────────────────────────────────────────
if screen -list | grep -q "[.]$SERVER[[:space:]]"; then
  echo "Enviando stop graceful..."
  screen -S "$SERVER" -X stuff "stop\\n"
  for i in $(seq 1 30); do
    sleep 2
    if ! screen -list | grep -q "[.]$SERVER[[:space:]]"; then
      echo "Parado en $((i*2))s"
      break
    fi
  done
fi

echo "Limpiando procesos Java huerfanos..."
kill_java_in_dir "$BASE"
screen -S "$SERVER" -X quit 2>/dev/null || true
find "$BASE" -name "session.lock" -delete && echo "session.lock limpiados" || true
sleep 1

# ── FASE 2: START ────────────────────────────────────────────────────────────
if [[ -f eula.txt ]]; then sed -i 's/^eula=.*/eula=true/' eula.txt; else echo "eula=true" > eula.txt; fi

if [[ -f run.sh ]]; then
  echo "Usando run.sh"
  chmod +x run.sh 2>/dev/null || true
  if [[ -f user_jvm_args.txt ]]; then
    sed -i "s/-Xmx[0-9]*[GgMm]/-Xmx\${RAM}G/" user_jvm_args.txt
    sed -i "s/-Xms[0-9]*[GgMm]/-Xms\${RAM}G/" user_jvm_args.txt
  fi
  : > "$LOG_FILE"
  screen -L -Logfile "$LOG_FILE" -dmS "$SERVER" bash -c "cd '$BASE' && ./run.sh"
  sleep 4
  screen -list | grep -q "[.]$SERVER[[:space:]]" && echo "SERVER_RESTARTED" && exit 0
  echo "ERROR: run.sh falló"; tail -n 30 "$LOG_FILE" 2>/dev/null; exit 1
fi

# Detectar Java según versión MC
if [ "$MC_VERSION" = "null" ] || [ -z "$MC_VERSION" ]; then
  JAVA="/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
elif [[ "$MC_VERSION" =~ ^1\\.(7|8|9|10|11|12|13|14|15|16|17) ]]; then
  JAVA="/usr/lib/jvm/java-8-openjdk-amd64/bin/java"
elif [[ "$MC_VERSION" =~ ^1\\.(18|19|20(\\.[0-4])?)$ ]]; then
  JAVA="/usr/lib/jvm/java-17-openjdk-amd64/bin/java"
else
  JAVA="/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
fi
[ -x "$JAVA" ] || JAVA="/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
echo "Usando Java: $JAVA"

JAR=""
if [[ -f fabric-server-launch.jar ]]; then JAR="fabric-server-launch.jar"
elif [[ -f server.jar ]]; then JAR="server.jar"
else JAR="$(ls *.jar 2>/dev/null | grep -viE 'installer|client|libraries' | head -n1)"; fi
[ -z "$JAR" ] && { echo "ERROR: No jar"; exit 1; }
echo "Jar: $JAR"

: > "$LOG_FILE"
screen -L -Logfile "$LOG_FILE" -dmS "$SERVER" bash -c "
  cd '$BASE' || exit 1
  exec $JAVA -Xms\${RAM}G -Xmx\${RAM}G -jar '$JAR' nogui
"
sleep 4
screen -list | grep -q "[.]$SERVER[[:space:]]" && echo "SERVER_RESTARTED" || { echo "ERROR al reiniciar"; tail -n 30 "$LOG_FILE" 2>/dev/null; exit 1; }`;

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
    const req = https.request(options, (res) => {
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
  console.log('Fetching workflow...');
  const r = await apiRequest('GET', `/api/v1/workflows/${WF_ID}`);
  const wf = r.body;
  console.log('Workflow:', wf.name, '| Nodes:', wf.nodes.length);

  const updates = { stop: STOP_SCRIPT, start: START_SCRIPT, restart: RESTART_SCRIPT };
  let count = 0;

  for (const node of wf.nodes) {
    if (updates[node.name]) {
      console.log(`Updating node: ${node.name}`);
      node.parameters.command = updates[node.name];
      count++;
    }
  }
  console.log(`Updated ${count} nodes`);

  const payload = {
    name: wf.name, nodes: wf.nodes, connections: wf.connections,
    settings: wf.settings || {}, staticData: wf.staticData || null
  };

  console.log('Saving...');
  const res = await apiRequest('PUT', `/api/v1/workflows/${WF_ID}`, payload);
  if (res.status > 201) {
    console.error('PUT failed:', res.status, JSON.stringify(res.body).substring(0, 300));
    process.exit(1);
  }

  // Verify
  let verified = 0;
  for (const node of res.body.nodes) {
    if (updates[node.name]) {
      const hasKillFn = node.parameters.command.includes('kill_java_in_dir');
      const hasLockClean = node.parameters.command.includes('session.lock');
      console.log(`✓ ${node.name}: kill_orphans=${hasKillFn}, clear_lock=${hasLockClean}`);
      verified++;
    }
  }
  console.log(`\nVerified ${verified}/3 nodes. Done!`);
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
