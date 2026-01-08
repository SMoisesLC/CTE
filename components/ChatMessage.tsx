
import React, { memo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Message, Role } from '../types';
import { User, FileText, ExternalLink, Paperclip, Check, ClipboardCopy } from 'lucide-react';
import { CTELogo } from './CTELogo';

interface ChatMessageProps {
  message: Message;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;
  const contentRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Función para copiar manteniendo formato HTML (Rich Text) para Word/Docs
  const handleCopyRichText = async () => {
    if (!contentRef.current) return;

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
          body { font-family: 'Calibri', sans-serif; font-size: 11pt; color: #000000; width: 210mm; margin: 0 auto; }
          h3 { font-size: 14pt; font-weight: bold; color: #2e4053; border-bottom: 1px solid #ccc; margin-top: 20px; text-transform: uppercase; }
          h4 { font-size: 12pt; font-weight: bold; color: #2874a6; margin-top: 15px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 15px; }
          th { background-color: #e2e8f0; border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; }
          td { border: 1px solid #cbd5e1; padding: 8px; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          blockquote { border-left: 4px solid #f59e0b; padding-left: 10px; margin-left: 0; color: #444; font-style: italic; background-color: #fffbeb; padding: 10px; }
          code { background-color: #f5f5f5; padding: 2px 4px; font-family: 'Consolas', monospace; }
        </style>
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
        </html>
      `;

      const textContent = contentRef.current.innerText;
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([textContent], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];

      await navigator.clipboard.write(data);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);

    } catch (err) {
      console.error('Error al copiar formato enriquecido:', err);
      if (contentRef.current) {
        navigator.clipboard.writeText(contentRef.current.innerText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    }
  };

  return (
    /* CONTENEDOR PRINCIPAL: Centrado tipo "Feed de Documentos" */
    <div className="flex w-full mb-10 justify-center">
      
      {/* 
         DIMENSIÓN A4 (210mm de ancho).
         En móvil usa w-full, en desktop usa 210mm fijo.
      */}
      <div className={`
        relative flex flex-col w-full md:w-[210mm] shrink-0 transition-all duration-300
        ${isModel 
          ? 'bg-white shadow-xl border border-slate-200'  // Hoja Blanca (Informe)
          : 'bg-[#fffdf5] shadow-md border border-amber-200/50' // Hoja Nota (Amarillo pálido técnico)
        }
      `}>
          
          {/* CABECERA DE LA HOJA (Avatar + Rol) - Simula membrete */}
          <div className={`
             flex items-center gap-3 px-8 py-4 border-b 
             ${isModel ? 'border-slate-100 bg-slate-50/50' : 'border-amber-100 bg-amber-50/50'}
          `}>
             <div className={`flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center border ${
               isModel ? 'bg-slate-900 border-slate-800' : 'bg-amber-100 border-amber-200 text-amber-700'
             }`}>
               {isModel ? <CTELogo className="w-6 h-6" /> : <User size={16} />}
             </div>
             <div className="flex flex-col">
               <span className={`text-xs font-bold uppercase tracking-wider ${isModel ? 'text-slate-800' : 'text-amber-800'}`}>
                 {isModel ? 'CTE Expert AI' : 'Consultor / Usuario'}
               </span>
               <span className="text-[10px] text-slate-400 font-mono">
                 {new Date(parseInt(message.id)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Ref: {message.id.slice(-4)}
               </span>
             </div>

             {/* Botón Copiar en cabecera */}
             {isModel && !message.isStreaming && (
                <button
                  onClick={handleCopyRichText}
                  className="ml-auto p-1.5 text-slate-400 hover:text-sky-600 transition-colors"
                  title="Copiar folio"
                >
                  {isCopied ? <Check size={16} /> : <ClipboardCopy size={16} />}
                </button>
             )}
          </div>

          {/* CUERPO DEL DOCUMENTO (Simulando márgenes de impresión A4) */}
          {/* Padding A4 estándar aprox 2.5cm = ~96px (p-10/p-12) */}
          <div ref={contentRef} className="px-8 py-8 md:px-12 md:py-10 min-h-[150px] markdown-body text-slate-900 leading-relaxed text-justify">
            
            {/* Attachment Preview (Inside the sheet) */}
            {message.attachment && (
              <div className="mb-6 p-3 border border-slate-200 bg-slate-50 rounded flex items-center gap-3 w-fit">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <Paperclip size={16} className="text-slate-500" />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-700">{message.attachment.name}</p>
                   <p className="text-[10px] text-slate-500 uppercase">{message.attachment.mimeType.split('/')[1]}</p>
                </div>
              </div>
            )}

            <ReactMarkdown
              className="prose max-w-none prose-p:text-slate-800 prose-headings:font-technical-title"
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h3: ({node, ...props}) => (
                  <h3 className="mt-8 mb-4 text-lg font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-2" {...props} />
                ),
                h4: ({node, ...props}) => (
                   <h4 className="mt-6 mb-3 text-base font-bold text-slate-800 flex items-center gap-2" {...props}>
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-sm"></span>
                      {props.children}
                   </h4>
                ),
                blockquote: ({node, ...props}) => (
                  <div className="my-6 pl-4 border-l-[3px] border-amber-500 bg-slate-50 py-3 pr-4 italic text-slate-600 text-sm">
                    {props.children}
                  </div>
                ),
                p: ({node, ...props}) => (
                  <p className="mb-4 text-[15px] leading-7" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="mb-4 space-y-1 pl-6 list-disc marker:text-slate-400" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="mb-4 space-y-2 pl-6 list-decimal marker:font-bold marker:text-slate-600" {...props} />
                ),
                code: ({node, inline, className, children, ...props}) => {
                  return inline ? (
                    <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm font-mono border border-slate-200" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-[#1e1e1e] text-slate-200 p-4 rounded-lg overflow-x-auto text-xs font-mono my-6 border-l-4 border-amber-500">
                      <code className="bg-transparent" {...props}>{children}</code>
                    </pre>
                  );
                },
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6 border border-slate-300">
                    <table className="w-full text-sm text-left border-collapse" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => (
                  <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-xs border-b border-slate-300" {...props} />
                ),
                tr: ({node, ...props}) => (
                  <tr className="border-b border-slate-200 last:border-0 hover:bg-slate-50" {...props} />
                ),
                th: ({node, ...props}) => (
                  <th className="px-4 py-3 border-r border-slate-200 last:border-0" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="px-4 py-3 border-r border-slate-200 last:border-0" {...props} />
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
            
            {message.isStreaming && (
               <div className="mt-4 flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
               </div>
            )}
          </div>

          {/* PIE DE PÁGINA (Fuentes) */}
          {message.groundingMetadata && message.groundingMetadata.length > 0 && (
            <div className="px-12 py-6 border-t border-slate-100 bg-slate-50/30">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Referencias Externas</p>
              <div className="flex flex-col gap-1">
                {message.groundingMetadata.map((chunk, idx) => (
                  chunk.web ? (
                    <a 
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-sky-700 hover:underline"
                    >
                      <ExternalLink size={10} />
                      <span className="truncate">{chunk.web.title}</span>
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export const ChatMessage = memo(ChatMessageComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isStreaming === nextProps.message.isStreaming &&
    prevProps.message.groundingMetadata === nextProps.message.groundingMetadata
  );
});

ChatMessage.displayName = 'ChatMessage';
