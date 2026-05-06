import React, { useState } from 'react';
import { Bot, Send, Sparkles, Zap, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import IncidentBanner from './IncidentBanner';

/**
 * Renderiza markdown ligero (bold, italic, code, headings, bullets, links)
 * de forma segura sin librerías. Suficiente para los outputs de la IA.
 */
const escapeHtml = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderMarkdown = (text) => {
  if (!text) return '';
  let html = escapeHtml(text);

  // Code blocks ```lang\ncode\n```
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="bg-black/40 border border-white/10 rounded-lg p-2.5 my-2 overflow-x-auto text-[12px] font-mono"><code>${code.trim()}</code></pre>`);

  // Inline code `x`
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-white/10 border border-white/15 rounded px-1.5 py-0.5 text-[12px] font-mono text-[#22C55E]">$1</code>');

  // Bold **x**
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic *x* (evitando colisión con bold ya procesado)
  html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em class="italic">$2</em>');

  // Headings (### x al inicio de línea)
  html = html.replace(/^#{3,6}\s+(.+)$/gm, '<div class="font-bold text-white text-[14px] mt-3 mb-1">$1</div>');
  html = html.replace(/^##\s+(.+)$/gm, '<div class="font-bold text-white text-[15px] mt-3 mb-1">$1</div>');
  html = html.replace(/^#\s+(.+)$/gm, '<div class="font-bold text-white text-[16px] mt-3 mb-1">$1</div>');

  // Numeric list "1. " — solo bold el número
  html = html.replace(/^(\d+)\.\s+/gm, '<span class="text-[#22C55E] font-bold">$1.</span> ');

  // Bullet list "- "
  html = html.replace(/^-\s+/gm, '<span class="text-[#22C55E]">•</span> ');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#22C55E] underline hover:text-[#1faa50]">$1</a>');

  return html;
};

/** Componente que renderiza markdown como HTML seguro */
const Markdown = ({ text }) => (
  <div
    className="leading-relaxed [&_strong]:font-bold [&_em]:italic"
    dangerouslySetInnerHTML={{ __html: renderMarkdown(text || '') }}
  />
);

const AIAssistantSidebar = ({ activeServer, user, isMobile = false, onClose = null }) => {
  const [inputStr, setInputStr] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef(null);

  const [messages, setMessages] = useState([
    { role: 'assistant', text: `¡Hola! Soy tu asistente de IA de MineLab. ¿En qué puedo ayudarte a gestionar el servidor "${activeServer?.server_name || 'actual'}" hoy?` }
  ]);
  const [workflowState, setWorkflowState] = useState(null);
  const [workflowHistory, setWorkflowHistory] = useState([]);

  React.useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (!activeServer?.id) return;

    const fetchInitialWorkflow = async () => {
      const { data, error } = await supabase
        .from('workflow_progress')
        .select('*')
        .eq('server_id', activeServer.id)
        .eq('status', 'running')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setWorkflowState(data);
        setWorkflowHistory([data]);
      }
    };

    fetchInitialWorkflow();

    const channel = supabase.channel(`workflow-progress-${activeServer.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workflow_progress',
        filter: `server_id=eq.${activeServer.id}`
      }, (payload) => {
        const newData = payload.new;

        if (newData.status === 'running' || newData.status === 'completed') {
          setWorkflowState(newData);

          setWorkflowHistory(prev => {
            // Reset on new workflow or if the workflow resets to 0 progress
            if (!prev.length || prev[0].workflow_type !== newData.workflow_type || (newData.progress === 0 && prev.length > 1)) {
              return [{ ...newData }];
            }

            const lastHistory = prev[prev.length - 1];
            if (lastHistory.current_step !== newData.current_step) {
              return [...prev, { ...newData }];
            } else {
              // Update current step inline (e.g. progress percentage updates)
              const newHistory = [...prev];
              newHistory[newHistory.length - 1] = { ...newData };
              return newHistory;
            }
          });

          if (newData.status === 'completed') {
            // Fast cleanup to free memory. The inline UI will hide instantly due to status check.
            setTimeout(() => {
              setWorkflowState(null);
              setWorkflowHistory([]);
            }, 1000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeServer?.id]);

  const lastSentRef = React.useRef(0);

  const handleSendMessage = async (e, forcedText = null) => {
    if (e) e.preventDefault();

    const textToSend = forcedText || inputStr.trim();
    if (!textToSend || isTyping || !activeServer?.id) return;

    // Rate limit: 3 segundos entre mensajes para evitar spam y costes runaway de OpenAI
    const now = Date.now();
    const elapsed = now - lastSentRef.current;
    if (elapsed < 3000) {
      const wait = Math.ceil((3000 - elapsed) / 1000);
      setMessages(prev => [...prev, { role: 'assistant', text: `⏱️ Espera ${wait}s para enviar otro mensaje.` }]);
      return;
    }
    lastSentRef.current = now;

    setInputStr('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      const response = await fetch('https://n8n.minelab.gg/webhook/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          server_id: activeServer.id
        })
      });

      // Try to parse the body regardless of status code — n8n sometimes returns
      // non-2xx even when la acción real tuvo éxito.
      let data = {};
      try { data = await response.json(); } catch (_) {}

      const rawText =
        data.response || data.output || data.message || data.reply || null;

      // Cleanup defensivo: algunos modelos (DeepSeek, gpt-oss) ocasionalmente
      // pegan su scratchpad/trace en la respuesta antes del texto real:
      //   "[Used tools: Tool: X, Input: {...}, Result: [...]] El log no muestra..."
      // Quitamos cualquier bloque `[Used tools: ...]]` al inicio + espacios sobrantes.
      const cleanText = rawText
        ? rawText
            // bloque al inicio: [Used tools: ... ]] (puede tener varios cierres)
            .replace(/^\s*\[\s*Used\s+tools?\s*:[\s\S]*?\]\]\s*/i, '')
            // bloque al inicio: [Tool: ... Result: ... ]
            .replace(/^\s*\[\s*Tool\s*:[\s\S]*?\]\s*/i, '')
            // backticks JSON al inicio
            .replace(/^\s*```[a-z]*\n[\s\S]*?\n```\s*/i, '')
            .trim()
        : null;

      const assistantText = cleanText || null;

      if (assistantText) {
        setMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
      } else {
        // n8n devolvió 200 OK pero sin texto útil → la IA no resolvió la
        // tool / hubo un parse fail / el LLM se quedó sin tokens. Antes
        // teníamos un fallback "He procesado tu solicitud" que MENTÍA al
        // cliente — preferimos mostrar honestidad: no se procesó nada.
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: "⚠️ No he podido procesar tu solicitud (la IA no devolvió respuesta). Reformula la pregunta o intenta de nuevo en unos segundos."
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'assistant', text: "Lo siento, ha ocurrido un error de conexión con la IA. Inténtalo de nuevo." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    'Instalar mod',
    'Arreglar error',
    'Optimizar servidor',
    'Cambiar versión'
  ];

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-[#141414]">
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/5 bg-[#141414] shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center border border-[#22C55E]/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Bot size={16} className="text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FFFFFF] tracking-wide flex items-center gap-1.5">
                ASISTENTE IA <Sparkles size={12} className="text-[#22C55E] opacity-80" />
              </h3>
              <p className="text-[10px] text-[#22C55E] font-medium uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block shadow-[0_0_8px_#22C55E] shrink-0"></span> ONLINE
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-[#B3B3B3] hover:text-white hover:bg-red-500/20 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-white/5 flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(null, action)}
              disabled={isTyping}
              className="px-2.5 py-1.5 bg-[#171717] border border-white/5 hover:border-[#22C55E]/30 hover:bg-[rgba(34,197,94,0.05)] rounded-lg text-xs font-medium text-[#B3B3B3] hover:text-[#FFFFFF] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap size={10} className="text-[#22C55E]" /> {action}
            </button>
          ))}
        </div>

        {/* Proactive incident banner */}
        <IncidentBanner
          activeServer={activeServer}
          onFixRequest={(msg) => handleSendMessage(null, msg)}
        />

        {/* Chat Area */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[85%] bg-[#22C55E] text-[#0B0B0B] font-semibold px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm whitespace-pre-wrap">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[90%] bg-[#171717] border border-[#2A2A2A] text-[#E5E5E5] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap">
                  <Markdown text={msg.text} />
                </div>
              )}
            </div>
          ))}
          {/* Inline Execution/Typing Bubble */}
          {(isTyping || (workflowState && workflowState.status !== 'completed')) && (
            <div className="flex justify-start mt-2">
              <div className="bg-[#171717] border border-[#2A2A2A] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md min-w-[60px]">

                {/* If we have a workflow state, show the progress UI inline */}
                {workflowState && workflowHistory.length > 0 ? (
                  <div className="flex flex-col gap-3 min-w-[220px]">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[11px] font-bold text-[#E5E5E5] uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={10} className="text-[#22C55E]" /> EJECUTANDO ACCIÓN
                      </h4>
                      <span className="text-xs font-bold text-[#22C55E]">{workflowState.progress}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#0B0B0B] rounded-full h-1.5 overflow-hidden border border-[#2A2A2A]">
                      <div
                        className="bg-[#22C55E] h-1.5 rounded-full transition-all duration-500 relative"
                        style={{ width: `${Math.max(3, workflowState.progress)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_1s_infinite]"></div>
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="flex flex-col gap-2 mt-1">
                      {workflowHistory.map((step, idx) => {
                        const isLast = idx === workflowHistory.length - 1;
                        const isCompleted = !isLast || step.status === 'completed';

                        return (
                          <div key={idx} className={`flex items-start gap-2.5 text-[13px] transition-all duration-300 ${isCompleted ? 'text-[#888888]' : 'text-[#FFFFFF] font-medium'}`}>
                            {isCompleted ? (
                              <span className="text-[14px] leading-none shrink-0 mt-[1px]">✅</span>
                            ) : (
                              <span className="text-[14px] leading-none shrink-0 mt-[1px] animate-pulse">⏳</span>
                            )}
                            <span className="leading-snug">{step.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Otherwise just show typing dots */
                  <div className="flex gap-1.5 h-[20px] items-center px-1">
                    <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#141414]">
          <form className="relative flex items-center group" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Pregúntale a la IA..."
              className="w-full bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl py-3.5 pl-4 pr-12 text-sm text-[#FFFFFF] transition-all focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] placeholder-[#6B6B6B] disabled:opacity-50"
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputStr.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] w-8 h-8 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Send size={14} className="ml-[-2px] mt-[1px]" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-[350px] bg-[#141414] border-l border-white/5 h-screen sticky top-0 flex flex-col z-20 shrink-0 hidden lg:flex shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-[#141414] shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex flex-col gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center border border-[#22C55E]/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Bot size={16} className="text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FFFFFF] tracking-wide flex items-center gap-1.5">
              ASISTENTE IA <Sparkles size={12} className="text-[#22C55E] opacity-80" />
            </h3>
            <p className="text-[10px] text-[#22C55E] font-medium uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse inline-block shadow-[0_0_8px_#22C55E] shrink-0"></span> ONLINE
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(null, action)}
              disabled={isTyping}
              className="px-2.5 py-1.5 bg-[#171717] border border-white/5 hover:border-[#22C55E]/30 hover:bg-[rgba(34,197,94,0.05)] rounded-lg text-xs font-medium text-[#B3B3B3] hover:text-[#FFFFFF] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap size={10} className="text-[#22C55E]" /> {action}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <div className="max-w-[85%] bg-[#22C55E] text-[#0B0B0B] font-semibold px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm whitespace-pre-wrap">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[90%] bg-[#171717] border border-[#2A2A2A] text-[#E5E5E5] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md text-sm leading-relaxed whitespace-pre-wrap">
                <Markdown text={msg.text} />
              </div>
            )}
          </div>
        ))}
        {/* Inline Execution/Typing Bubble */}
        {(isTyping || (workflowState && workflowState.status !== 'completed')) && (
          <div className="flex justify-start mt-2">
            <div className="bg-[#171717] border border-[#2A2A2A] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md min-w-[60px]">

              {/* If we have a workflow state, show the progress UI inline */}
              {workflowState && workflowHistory.length > 0 ? (
                <div className="flex flex-col gap-3 min-w-[220px]">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[11px] font-bold text-[#E5E5E5] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={10} className="text-[#22C55E]" /> EJECUTANDO ACCIÓN
                    </h4>
                    <span className="text-xs font-bold text-[#22C55E]">{workflowState.progress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#0B0B0B] rounded-full h-1.5 overflow-hidden border border-[#2A2A2A]">
                    <div
                      className="bg-[#22C55E] h-1.5 rounded-full transition-all duration-500 relative"
                      style={{ width: `${Math.max(3, workflowState.progress)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_1s_infinite]"></div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="flex flex-col gap-2 mt-1">
                    {workflowHistory.map((step, idx) => {
                      const isLast = idx === workflowHistory.length - 1;
                      const isCompleted = !isLast || step.status === 'completed';

                      return (
                        <div key={idx} className={`flex items-start gap-2.5 text-[13px] transition-all duration-300 ${isCompleted ? 'text-[#888888]' : 'text-[#FFFFFF] font-medium'}`}>
                          {isCompleted ? (
                            <span className="text-[14px] leading-none shrink-0 mt-[1px]">✅</span>
                          ) : (
                            <span className="text-[14px] leading-none shrink-0 mt-[1px] animate-pulse">⏳</span>
                          )}
                          <span className="leading-snug">{step.message}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Otherwise just show typing dots */
                <div className="flex gap-1.5 h-[20px] items-center px-1">
                  <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#141414]">
        <form className="relative flex items-center group" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Pregúntale a la IA..."
            className="w-full bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl py-3.5 pl-4 pr-12 text-sm text-[#FFFFFF] transition-all focus:outline-none focus:border-[#22C55E]/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.1)] placeholder-[#6B6B6B] disabled:opacity-50"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputStr.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22C55E] hover:bg-[#1faa50] text-[#0B0B0B] w-8 h-8 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <Send size={14} className="ml-[-2px] mt-[1px]" />
          </button>
        </form>
      </div>

    </aside>
  );
};

export default AIAssistantSidebar;
