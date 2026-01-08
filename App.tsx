
import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Sparkles, Eraser, Paperclip, X, ArrowLeft } from 'lucide-react';
import { CTEContext, Message, Role, GroundingChunk, Attachment, HistoryEntry, Project } from './types';
import { CTE_DOCUMENTS, INITIAL_SUGGESTIONS } from './constants';
import { Sidebar, SidebarTab } from './components/Sidebar'; // Importamos SidebarTab type
import { ChatMessage } from './components/ChatMessage';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Dashboard } from './components/Dashboard'; // Importar Dashboard
import { streamGeminiResponse } from './services/geminiService';

const LOADING_STEPS = [
  "📄 Leyendo documentación del contexto...",
  "🔍 Localizando tablas y artículos aplicables...",
  "📐 Verificando fórmulas de cálculo...",
  "✍️ Redactando justificación técnica detallada...",
  "📊 Maquetando informe de memoria (Formato A4)..."
];

const App: React.FC = () => {
  const [context, setContext] = useState<CTEContext>(CTEContext.GENERAL);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // ESTADOS DE PERSISTENCIA
  const [history, setHistory] = useState<HistoryEntry[]>([]); 
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // ESTADOS DE NAVEGACIÓN
  const [showDashboard, setShowDashboard] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('normativa');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_STEPS[0]);
  
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const streamTextRef = useRef('');
  const lastUpdateRef = useRef(0);
  const isUserAtBottomRef = useRef(true);

  // --- CARGA INICIAL (HISTORIAL Y PROYECTOS) ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('cte_history_v1');
    const savedProjects = localStorage.getItem('cte_projects_v1');
    
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    if (savedProjects) {
      try { setProjects(JSON.parse(savedProjects)); } catch (e) { console.error(e); }
    }
  }, []);

  // --- GESTIÓN DE PROYECTOS ---
  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now()
    };
    setProjects(prev => {
      const updated = [newProject, ...prev];
      localStorage.setItem('cte_projects_v1', JSON.stringify(updated));
      return updated;
    });
    setActiveProjectId(newProject.id); // Activar automáticamente al crear
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      localStorage.setItem('cte_projects_v1', JSON.stringify(updated));
      return updated;
    });
    if (activeProjectId === projectId) setActiveProjectId(null);
  };

  // --- NAVEGACIÓN DASHBOARD -> APP ---
  const handleDashboardAction = (action: 'NEW' | 'BROWSE' | 'PROJECTS' | 'HISTORY') => {
    if (action === 'NEW') {
      setShowDashboard(false);
      setSidebarTab('normativa');
      // Foco en input al entrar (pequeño delay para render)
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (action === 'BROWSE') {
      setSidebarOpen(true); // Abrir sidebar en móvil
      setSidebarTab('normativa');
      setShowDashboard(false);
    } else if (action === 'PROJECTS') {
      setSidebarOpen(true);
      setSidebarTab('proyectos');
      // No cambiamos showDashboard a false necesariamente, o sí? 
      // Si el usuario quiere ver proyectos, quizás quiera ir al chat.
      // Vamos a asumir que "Gestión" implica ver el panel lateral.
      // Podemos quedarnos en dashboard o ir al chat vacío.
      // Vamos al chat vacío para ver el contexto.
      setShowDashboard(false);
    } else if (action === 'HISTORY') {
      setSidebarOpen(true);
      setSidebarTab('historial');
      setShowDashboard(false);
    }
  };

  const handleReturnToDashboard = () => {
     setShowDashboard(true);
  };

  // --- GUARDADO AUTOMÁTICO (Con soporte de Proyecto) ---
  const saveHistoryEntry = (userMsg: Message, aiMsg: Message, ctx: CTEContext) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      context: ctx,
      query: userMsg.content.substring(0, 80) + (userMsg.content.length > 80 ? '...' : ''),
      messages: [userMsg, aiMsg],
      projectId: activeProjectId || undefined // VINCULACIÓN AL PROYECTO ACTIVO
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('cte_history_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLoadHistory = (entry: HistoryEntry) => {
    setContext(entry.context);
    setMessages(entry.messages);
    setSidebarOpen(false); 
    if (entry.projectId) setActiveProjectId(entry.projectId);
    setShowDashboard(false); // Asegurar que salimos del dashboard al cargar ficha
    
    setTimeout(() => {
        if(chatContainerRef.current) chatContainerRef.current.scrollTop = 0;
    }, 100);
  };

  const deleteHistoryEntry = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('cte_history_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const checkIfUserAtBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 150;
  };

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    isUserAtBottomRef.current = checkIfUserAtBottom();
  };

  useEffect(() => {
    if (isUserAtBottomRef.current && !showDashboard) {
      scrollToBottom();
    }
  }, [messages, loadingText, isLoading, showDashboard]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingText(LOADING_STEPS[0]);
      return;
    }

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < LOADING_STEPS.length) {
        setLoadingText(LOADING_STEPS[stepIndex]);
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleContextChange = (newContextId: CTEContext) => {
    if (context === newContextId) return;

    setContext(newContextId);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: `🔔 **Modo Experto Activado: ${newContextId}**\n\nHe cargado las instrucciones específicas y la base de conocimiento para *${newContextId}*.`
      }
    ]);
    setShowDashboard(false); // Salir del dashboard al cambiar contexto desde sidebar
    isUserAtBottomRef.current = true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("El archivo es demasiado grande (max 20MB para esta demo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      setSelectedFile({
        name: file.name,
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    // Asegurar que salimos del dashboard si se envía mensaje
    if (showDashboard) setShowDashboard(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      attachment: selectedFile || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    isUserAtBottomRef.current = true;

    setInput('');
    const currentAttachment = selectedFile;
    setSelectedFile(null);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    const modelMessage: Message = {
      id: modelMessageId,
      role: Role.MODEL,
      content: '', 
      isStreaming: true,
      groundingMetadata: []
    };

    setMessages(prev => [...prev, modelMessage]);

    streamTextRef.current = '';
    lastUpdateRef.current = 0;
    const currentContext = context; // Capturar contexto al inicio

    try {
      const historyForApi = messages.slice(-6); 
      const groundingChunks: GroundingChunk[] = [];

      await streamGeminiResponse(
        text,
        currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : undefined,
        currentContext,
        historyForApi,
        (chunkText) => {
          streamTextRef.current += chunkText;
          const now = Date.now();
          if (now - lastUpdateRef.current > 75) {
            setMessages(prev => {
              const newHistory = [...prev];
              const targetIndex = newHistory.findIndex(m => m.id === modelMessageId);
              if (targetIndex !== -1) {
                newHistory[targetIndex] = {
                  ...newHistory[targetIndex],
                  content: streamTextRef.current
                };
              }
              return newHistory;
            });
            lastUpdateRef.current = now;
          }
        },
        (chunks) => {
          groundingChunks.push(...chunks);
          setMessages(prev => prev.map(m => 
            m.id === modelMessageId 
              ? { ...m, groundingMetadata: groundingChunks } 
              : m
          ));
        }
      );

      // Finalizar mensaje
      const finalAiMessage: Message = {
         ...modelMessage,
         content: streamTextRef.current,
         isStreaming: false,
         groundingMetadata: groundingChunks.length > 0 ? groundingChunks : undefined
      };

      setMessages(prev => prev.map(m => 
        m.id === modelMessageId ? finalAiMessage : m
      ));

      // ---> AQUÍ SE GUARDA EN EL HISTORIAL <---
      if (streamTextRef.current.length > 50) {
        saveHistoryEntry(userMessage, finalAiMessage, currentContext);
      }

    } catch (error: any) {
      console.error("Error sending message:", error);
      let errorMessage = "\n\n**[Error de conexión]**";
      const errStr = (error.message || error.toString() || "").toUpperCase();
      if (errStr.includes("429")) errorMessage += "\n🛑 **Límite de Cuota Excedido (429)**.";
      else if (errStr.includes("404")) errorMessage += "\n⚠️ **Error de Servicio (404)**.";
      else errorMessage += "\n⚠️ Hubo un problema al generar el resto de la respuesta.";

      setMessages(prev => prev.map(m => 
        m.id === modelMessageId ? { ...m, content: (m.content || "") + errorMessage, isStreaming: false } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('¿Limpiar vista actual? (El historial se mantiene)')) {
      setMessages([]);
    }
  };

  const activeDoc = CTE_DOCUMENTS.find(d => d.id === context);
  const activeProjectName = projects.find(p => p.id === activeProjectId)?.name;

  return (
    <div className="fixed inset-0 flex bg-slate-100 overflow-hidden text-slate-900">
      <Sidebar 
        activeContextId={context} 
        onContextChange={handleContextChange}
        onAction={handleSend}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        
        // Props Historial y Proyectos
        history={history}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={deleteHistoryEntry}
        projects={projects}
        activeProjectId={activeProjectId}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onActivateProject={setActiveProjectId}
        
        // Props Tabs
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="font-bold text-slate-800 text-lg md:text-xl flex items-center gap-2">
                 {/* Si estamos en Dashboard, mostrar branding general, si no, el DOC */}
                 {!showDashboard && (
                    <button 
                      onClick={handleReturnToDashboard} 
                      className="mr-2 text-slate-400 hover:text-slate-800 transition-colors"
                      title="Volver al Inicio"
                    >
                       <ArrowLeft size={18} />
                    </button>
                 )}
                 {showDashboard ? "Panel de Control" : activeDoc?.title}
              </h1>
              {activeProjectName && (
                 <div className="hidden md:flex items-center gap-1.5 text-amber-600 text-[11px] font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Proyecto Activo: {activeProjectName}
                 </div>
              )}
              {!activeProjectName && !showDashboard && (
                  <p className="text-xs text-slate-500 hidden md:block">
                  {activeDoc?.description}
                  </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
             {!showDashboard && (
                <button 
                  onClick={handleClearChat}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                  title="Limpiar vista"
                >
                  <Eraser size={20} />
                </button>
             )}
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL: O DASHBOARD O CHAT */}
        {showDashboard ? (
          <Dashboard 
             onAction={handleDashboardAction} 
             activeProjectName={activeProjectName}
          />
        ) : (
            <>
              {/* Chat Area - CENTRADO PARA A4 */}
              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth flex flex-col items-center bg-[#f0f2f5]"
              >
                <div className="w-full pb-4 flex flex-col items-center">
                  {messages.length === 0 ? (
                    <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
                        <Sparkles size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Consulta Técnica Activa
                      </h2>
                      <p className="text-slate-500 max-w-md mx-auto mb-8">
                        {activeProjectName 
                          ? `Expediente: ${activeProjectName}.` 
                          : "Introduce los datos de partida para comenzar la justificación."
                        }
                      </p>
                      
                      <div className="grid gap-3 mx-auto grid-cols-1 md:grid-cols-2">
                        {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(suggestion)}
                            className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-sm text-slate-700"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => {
                        if (msg.role === Role.MODEL && msg.isStreaming && msg.content.length === 0) {
                          return <LoadingIndicator key={msg.id} text={loadingText} />;
                        }
                        return <ChatMessage key={msg.id} message={msg} />;
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* Input Area (Solo visible en modo Chat) */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0 z-20 flex justify-center">
                <div className="w-full max-w-[210mm]">
                  {selectedFile && (
                    <div className="mb-2 flex items-start">
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <Paperclip size={16} />
                        <span className="font-medium max-w-xs truncate">{selectedFile.name}</span>
                        <button 
                          onClick={() => setSelectedFile(null)}
                          className="ml-2 hover:bg-amber-100 p-1 rounded-full transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative flex items-end gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="application/pdf,image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 mb-[2px] text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-all"
                      title="Adjuntar PDF o Imagen"
                    >
                      <Paperclip size={24} />
                    </button>
                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={isLoading ? "Esperando respuesta..." : `Describe la consulta técnica...`}
                        disabled={isLoading}
                        className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none max-h-32 min-h-[60px]"
                        rows={1}
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={(!input.trim() && !selectedFile) || isLoading}
                        className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                          (input.trim() || selectedFile) && !isLoading
                            ? 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="text-center mt-2 flex justify-center items-center gap-2">
                     <p className="text-[10px] text-slate-400">
                       CTE Expert AI. Verifica la normativa oficial.
                     </p>
                     {activeProjectName && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">
                          PROJ: {activeProjectName}
                        </span>
                     )}
                  </div>
                </div>
              </div>
            </>
        )}
      </div>
    </div>
  );
};

export default App;
