import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Sparkles, Eraser, Paperclip, X } from 'lucide-react';
import { CTEContext, Message, Role, GroundingChunk, Attachment } from './types';
import { CTE_DOCUMENTS, INITIAL_SUGGESTIONS } from './constants';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { streamGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [context, setContext] = useState<CTEContext>(CTEContext.GENERAL);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size if necessary (Gemini has high limits, but browser memory is finite)
    if (file.size > 20 * 1024 * 1024) {
      alert("El archivo es demasiado grande (max 20MB para esta demo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data:application/pdf;base64, prefix
      const base64Data = base64String.split(',')[1];
      
      setSelectedFile({
        name: file.name,
        mimeType: file.type,
        data: base64Data
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      attachment: selectedFile || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentAttachment = selectedFile; // Capture for service call
    setSelectedFile(null); // Clear after sending
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

    try {
      // Pass history excluding the message we just added (the userMessage) 
      // because geminiService handles the current prompt separately.
      // Although geminiService takes messageHistory, we pass the messages BEFORE the current one.
      const history = messages.slice(-10); 

      let fullText = '';
      const groundingChunks: GroundingChunk[] = [];

      await streamGeminiResponse(
        text,
        currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : undefined,
        context,
        history,
        (chunkText) => {
          fullText += chunkText;
          setMessages(prev => prev.map(m => 
            m.id === modelMessageId 
              ? { ...m, content: fullText } 
              : m
          ));
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
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.map(m => 
        m.id === modelMessageId 
          ? { ...m, content: "Lo siento, ha ocurrido un error al conectar con el servicio. Por favor, verifica tu API Key o inténtalo más tarde." } 
          : m
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(m => 
        m.id === modelMessageId 
          ? { ...m, isStreaming: false } 
          : m
      ));
    }
  };

  const handleClearChat = () => {
    if (window.confirm('¿Borrar historial de chat?')) {
      setMessages([]);
    }
  };

  const activeDoc = CTE_DOCUMENTS.find(d => d.id === context);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        currentContext={context} 
        onContextChange={(ctx) => {
          setContext(ctx);
          setMessages([]); 
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-bold text-slate-800 text-lg md:text-xl flex items-center gap-2">
                {activeDoc?.title}
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">
                {activeDoc?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Borrar chat"
            >
              <Eraser size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  ¿En qué puedo ayudarte con el CTE?
                </h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Gemini ya conoce la normativa general. Si tienes un documento específico (PDF del BOE, planos, memorias), adjúntalo abajo.
                </p>
                
                <div className="grid gap-3 max-w-2xl mx-auto grid-cols-1 md:grid-cols-2">
                  {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-sm text-slate-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto">
            
            {/* Selected File Preview */}
            {selectedFile && (
              <div className="mb-2 flex items-start">
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <Paperclip size={16} />
                  <span className="font-medium max-w-xs truncate">{selectedFile.name}</span>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="ml-2 hover:bg-blue-100 p-1 rounded-full transition-colors"
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
                accept="application/pdf,image/*" // Accepting PDFs and Images
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 mb-[2px] text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                title="Adjuntar PDF o Imagen"
              >
                <Paperclip size={24} />
              </button>

              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Escribe tu consulta sobre ${activeDoc?.title}...`}
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 min-h-[60px]"
                  rows={1}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                    (input.trim() || selectedFile) && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">
               CTE Expert AI. Verifica la normativa oficial.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;