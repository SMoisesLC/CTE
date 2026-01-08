
import React, { useState, useEffect } from 'react';
import { DBInfo, SidebarAction } from '../types';
import * as LucideIcons from 'lucide-react';
import { FileText, ChevronDown, ChevronRight, ExternalLink, Scale } from 'lucide-react';

interface SidebarItemProps {
  doc: DBInfo;
  isActive: boolean;
  onActivateContext: (actionPrompt?: string) => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ doc, isActive, onActivateContext }) => {
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const IconComponent = doc.icon && (LucideIcons as any)[doc.icon] 
    ? (LucideIcons as any)[doc.icon] 
    : FileText;

  // Renderizado de iconos dinámicos para las acciones
  const renderActionIcon = (iconName: string, size: number = 14) => {
    const ActionIcon = (LucideIcons as any)[iconName] || LucideIcons.Zap;
    return <ActionIcon size={size} />;
  };

  return (
    <div className={`
      mb-3 rounded-xl transition-all duration-300 border
      ${isActive 
        ? 'bg-[#0f172a] border-amber-500/40 shadow-lg shadow-amber-900/10' 
        : 'bg-[#0f172a]/40 border-slate-800 hover:border-slate-700 hover:bg-[#0f172a]/80'}
    `}>
      
      {/* --- NIVEL 1: CABECERA DOCUMENTO (DB) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 flex items-center gap-3 text-left focus:outline-none group relative overflow-hidden"
      >
        {/* Indicador de activo (borde izquierdo brillante) */}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}

        <div className={`
          flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors
          ${isActive 
            ? 'bg-amber-500 text-slate-950' 
            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-amber-400'}
        `}>
          <IconComponent size={20} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          {/* TÍTULO NIVEL 1: Century Gothic Bold, 15px, Blanco/Claro */}
          <h2 className={`font-technical-title text-[15px] font-bold tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
            {doc.title}
          </h2>
          {/* Subtítulo sutil */}
          <p className={`text-[12px] mt-1 truncate ${isActive ? 'text-amber-500/90' : 'text-slate-500 group-hover:text-slate-400'}`}>
            {doc.description.split('.')[0]}...
          </p>
        </div>

        <div className="text-slate-600 group-hover:text-slate-400 flex-shrink-0">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* --- CUERPO DESPLEGABLE --- */}
      {isOpen && (
        <div className="px-3 pb-3 pt-1 animate-in slide-in-from-top-1 duration-200">
          
          {/* Barra de Herramientas del Documento (PDF + BOE + Chat) */}
          <div className="flex gap-2 mb-4 mt-2 border-b border-slate-800 pb-4">
             {/* PDF Oficial */}
             <a href={doc.url} target="_blank" rel="noopener noreferrer"
               className="flex-1 flex justify-center items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] py-2 rounded-md border border-slate-700 transition-colors"
               title="Ver PDF Técnico">
               <FileText size={13} /> 
               <span>PDF</span>
            </a>
            
            {/* ENLACE BOE OFICIAL (Nueva Funcionalidad PRO) */}
            {doc.boeUrl && (
              <a href={doc.boeUrl} target="_blank" rel="noopener noreferrer"
                 className="flex-1 flex justify-center items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-sky-400 text-[11px] py-2 rounded-md border border-slate-700 transition-colors"
                 title="Ver en BOE.es">
                 <Scale size={13} /> 
                 <span>BOE.es</span>
              </a>
            )}

            {/* Activar Chat */}
            <button 
              onClick={(e) => { e.stopPropagation(); onActivateContext(); }}
              className="flex-1 flex justify-center items-center gap-1.5 bg-amber-950/20 hover:bg-amber-900/40 text-amber-500/80 hover:text-amber-400 text-[11px] py-2 rounded-md border border-amber-900/30 hover:border-amber-500/50 transition-colors"
              title="Activar Contexto IA">
               <LucideIcons.Bot size={13} />
               <span>Chat</span>
            </button>
          </div>

          {/* --- NIVEL 2: SECCIONES TÉCNICAS --- */}
          <div className="space-y-6 pl-1">
            {doc.subItems.length > 0 ? (
              doc.subItems.map((sub) => (
                <div key={sub.id} className="relative group/section">
                  {/* Línea vertical decorativa sutil */}
                  <div className="absolute left-[3px] top-1 bottom-0 w-[2px] bg-slate-800 group-hover/section:bg-slate-700 transition-colors rounded-full"></div>
                  
                  <div className="pl-5">
                    {/* Título de Sección (Nivel 2) */}
                    <div className="mb-2">
                      <h3 className="font-technical-title text-[14px] font-medium text-sky-400 leading-tight flex items-center gap-2">
                         {sub.title}
                      </h3>
                      <p className="text-[12px] italic text-slate-500 leading-snug mt-0.5 font-light">
                        ({sub.description})
                      </p>
                    </div>

                    {/* --- NIVEL 3: ACCIONES OPERATIVAS (BOTONES) --- */}
                    {sub.actions && sub.actions.length > 0 && (
                      <div className="grid grid-cols-1 gap-2 mt-3">
                        {sub.actions.map((action, idx) => {
                          // Estilos de botones de acción "Nivel 3"
                          let btnClass = "";
                          let iconColorClass = "";
                          
                          if (action.type === 'calc') {
                            btnClass = "bg-gradient-to-r from-amber-950/40 to-transparent border-l-2 border-l-amber-500 border-y border-r border-y-slate-800 border-r-slate-800 hover:border-l-amber-400 hover:from-amber-900/50 text-amber-100";
                            iconColorClass = "text-amber-500";
                          } else if (action.type === 'check') {
                            btnClass = "bg-gradient-to-r from-emerald-950/40 to-transparent border-l-2 border-l-emerald-500 border-y border-r border-y-slate-800 border-r-slate-800 hover:border-l-emerald-400 hover:from-emerald-900/50 text-emerald-100";
                            iconColorClass = "text-emerald-500";
                          } else {
                            btnClass = "bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300 hover:text-white";
                            iconColorClass = "text-sky-400";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); onActivateContext(action.prompt); }}
                              className={`
                                group/btn relative flex items-center gap-3 px-3 py-2 rounded hover:shadow-lg transition-all text-xs text-left
                                ${btnClass}
                              `}
                            >
                              <span className={`flex-shrink-0 ${iconColorClass}`}>
                                {renderActionIcon(action.icon, 15)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="block font-medium truncate">{action.label}</span>
                              </div>
                              <LucideIcons.Play size={10} className="opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all text-slate-500" fill="currentColor" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-600 italic px-2">
                Consulta general disponible.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
