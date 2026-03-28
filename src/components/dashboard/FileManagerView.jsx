import React, { useEffect, useState, useRef } from 'react';
import { FolderOpen, File, Download, Trash2, Upload, ChevronLeft, Save, Edit3, X, Loader2 } from 'lucide-react';

const FileManagerView = ({ server }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      await fetch(`${import.meta.env.VITE_API_URL}/api/files/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          server: serverId,
          file: filePath,
          content,
        }),
      });
      // Optionally show a success toast here
    } catch (err) {
      console.error("Error guardando archivo", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteFile = async (name) => {
    const ok = window.confirm(`¿Seguro que quieres borrar "${name}"?`);
    if (!ok || !serverId) return;

    const filePath = currentPath ? `${currentPath}/${name}` : name;
    await fetch(`${import.meta.env.VITE_API_URL}/api/files/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ server: serverId, file: filePath }),
    });

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

    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("server", serverId);
    form.append("path", currentPath);

    await fetch(`${import.meta.env.VITE_API_URL}/api/files/upload`, {
      method: "POST",
      body: form,
    });

    e.target.value = "";
    loadFiles();
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
                    onClick={(e) => { e.stopPropagation(); deleteFile(f.name); }}
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
  );
};

export default FileManagerView;
