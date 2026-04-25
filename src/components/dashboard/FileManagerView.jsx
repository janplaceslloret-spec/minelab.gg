import React, { useEffect, useState, useRef } from 'react';
import { FolderOpen, File, Download, Trash2, Upload, ChevronLeft, Save, Edit3, X, Loader2, AlertTriangle } from 'lucide-react';

const API_KEY = import.meta.env.VITE_MC_API_KEY || 'minelab_k3y_Xp9mR7_2026';

/* ── Confirmation Modal ────────────────────────────────────────────── */
const ConfirmModal = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#111827] border border-[#2A2A2A] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">¿Borrar "{name}"?</p>
          <p className="text-[#6B6B6B] text-xs mt-0.5">Esta acción no se puede deshacer.</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-[#B3B3B3] hover:text-white hover:bg-[#2A2A2A] transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
        >
          Borrar
        </button>
      </div>
    </div>
  </div>
);

const FileManagerView = ({ server }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { name, path }
  const fileInputRef = useRef(null);

  const serverId = server?.id;

  const loadFiles = async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files?server=${serverId}&path=${encodeURIComponent(currentPath)}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando archivos", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [serverId, currentPath]);

  const openFile = async (file) => {
    if (file.isDirectory) {
      setSelectedFile(null);
      setContent("");
      setCurrentPath((p) => (p ? `${p}/${file.name}` : file.name));
      return;
    }

    try {
      setLoading(true);
      const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/read?server=${serverId}&file=${encodeURIComponent(filePath)}`);
      const data = await res.json();

      setSelectedFile(file);
      setContent(data.content || "");
    } catch (err) {
      console.error("Error leyendo archivo", err);
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !serverId) return;
    try {
      setSaving(true);
      const filePath = currentPath ? `${currentPath}/${selectedFile.name}` : selectedFile.name;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ server: serverId, file: filePath, content }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Error guardando archivo", err);
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (name) => {
    const filePath = currentPath ? `${currentPath}/${name}` : name;
    setConfirmDelete({ name, path: filePath });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete || !serverId) return;
    const { name, path: filePath } = confirmDelete;
    setConfirmDelete(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({ server: serverId, file: filePath }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("Error borrando archivo", err);
      alert(`Error al borrar: ${err.message}`);
    }

    if (selectedFile?.name === name) {
      setSelectedFile(null);
      setContent("");
    }
    loadFiles();
  };

  const downloadItem = (item) => {
    if (!serverId) return;
    const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
    window.open(`${import.meta.env.VITE_API_URL}/api/files/download?server=${serverId}&file=${encodeURIComponent(filePath)}`);
  };

  const uploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !serverId) return;

    // Guard: Cloudflare free tier hard-limits requests to 100 MB
    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB (matches backend multer limit)
    if (file.size > MAX_SIZE) {
      alert(`Archivo demasiado grande. Máximo ${MAX_SIZE / (1024 * 1024)} MB.`);
      e.target.value = "";
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("server", serverId);
    form.append("path", currentPath);

    // Abort after 90s (Cloudflare free plan kills connection at 100s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/files/upload`, {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: form,
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        alert("La subida ha tardado demasiado y se ha cancelado. Prueba con un archivo más pequeño o revisa tu conexión.");
      } else {
        alert(`Error al subir el archivo: ${err.message}`);
      }
      console.error("[uploadFile]", err);
    } finally {
      clearTimeout(timeoutId);
      e.target.value = "";
      setLoading(false);
      loadFiles();
    }
  };

  const goBack = () => {
    if (!currentPath) return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
    setSelectedFile(null);
    setContent("");
  };

  return (
    <>
      {confirmDelete && (
        <ConfirmModal
          name={confirmDelete.name}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex flex-col md:flex-row h-full w-full bg-[#121212] rounded-xl border border-[#2A2A2A] overflow-hidden min-h-[600px] animate-in fade-in duration-300">

        {/* Sidebar Explorer */}
        <div className="w-full md:w-[300px] border-r border-[#2A2A2A] bg-[#0B0B0B] flex flex-col shrink-0">

          {/* Explorer Header */}
          <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#121212]">
             <div className="flex items-center gap-2">
               <button
                 onClick={goBack}
                 disabled={!currentPath}
                 className={`p-1.5 rounded-lg transition-colors ${currentPath ? 'hover:bg-[#2A2A2A] text-[#FFFFFF]' : 'text-[#6B6B6B] opacity-50 cursor-not-allowed'}`}
               >
                 <ChevronLeft size={18} />
               </button>
               <span className="text-sm font-bold truncate max-w-[150px] text-[#B3B3B3]">
                 /{currentPath || ''}
               </span>
             </div>

             <div>
               <input type="file" ref={fileInputRef} onChange={uploadFile} className="hidden" />
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="p-1.5 hover:bg-[#2A2A2A] text-[#B3B3B3] hover:text-[#22C55E] rounded-lg transition-colors"
                 title="Subir archivo"
               >
                 <Upload size={16} />
               </button>
             </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {loading && !selectedFile ? (
              <div className="flex items-center justify-center p-8 text-[#6B6B6B]">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center p-8 text-[#6B6B6B] text-sm">
                Carpeta vacía
              </div>
            ) : (
              files.map((f) => (
                <div
                  key={f.name}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-colors ${
                    selectedFile?.name === f.name ? 'bg-[#22C55E]/10 border border-[#22C55E]/30' : 'hover:bg-[#171717] border border-transparent hover:border-[#2A2A2A]'
                  }`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => openFile(f)}
                  >
                    {f.isDirectory ? (
                      <FolderOpen size={16} className="text-amber-500 shrink-0" />
                    ) : (
                      <File size={16} className={selectedFile?.name === f.name ? "text-[#22C55E] shrink-0" : "text-[#B3B3B3] shrink-0"} />
                    )}
                    <span className={`text-sm truncate ${selectedFile?.name === f.name ? 'text-[#22C55E] font-medium' : 'text-[#B3B3B3] group-hover:text-white'}`}>
                      {f.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadItem(f); }}
                      className="p-1.5 hover:bg-[#2A2A2A] text-[#B3B3B3] hover:text-white rounded-md"
                      title="Descargar"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); requestDelete(f.name); }}
                      className="p-1.5 hover:bg-red-500/20 text-[#B3B3B3] hover:text-red-400 rounded-md"
                      title="Borrar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* File Editor Area */}
        <div className="flex-1 flex flex-col bg-[#121212]">
          {selectedFile ? (
            <>
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-[#2A2A2A] bg-[#0B0B0B] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 size={18} className="text-[#22C55E]" />
                  <span className="font-mono text-sm font-bold text-[#FFFFFF]">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveFile}
                    disabled={saving}
                    className="px-4 py-2 bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] text-sm font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Guardar
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 hover:bg-[#2A2A2A] text-[#6B6B6B] hover:text-white rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 relative">
                 {loading && <div className="absolute inset-0 bg-[#121212]/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="animate-spin text-[#22C55E]" size={32}/></div>}
                 <textarea
                   className="absolute inset-0 w-full h-full bg-[#121212] p-6 text-sm font-mono text-[#E5E5E5] resize-none focus:outline-none scrollbar-thin scrollbar-thumb-zinc-800"
                   value={content}
                   onChange={(e) => setContent(e.target.value)}
                   spellCheck={false}
                 />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#6B6B6B] p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#171717] border border-[#2A2A2A] flex items-center justify-center mb-4">
                 <File size={32} className="text-[#2A2A2A]" />
              </div>
              <p className="font-medium">Selecciona un archivo para editar</p>
              <p className="text-sm mt-1 max-w-sm text-center">Navega por los directorios en el panel izquierdo para explorar y modificar la configuración de tu servidor.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default FileManagerView;
