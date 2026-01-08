import React, { useState, useEffect } from 'react';
import { CTE_DOCUMENTS } from '../constants';
import { CTEContext } from '../types';
import * as Icons from 'lucide-react';

interface SidebarProps {
  currentContext: CTEContext;
  onContextChange: (ctx: CTEContext) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentContext, onContextChange, isOpen, onClose }) => {
  // State to track expanded sections. Default to current context expanded.
  const [expandedId, setExpandedId] = useState<CTEContext | null>(currentContext);

  useEffect(() => {
    // When context changes externally (e.g. initial load), ensure that section is expanded
    setExpandedId(currentContext);
  }, [currentContext]);

  const toggleExpand = (id: CTEContext) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      onContextChange(id); // Clicking header also selects the context
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-80 bg-slate-900 text-slate-300 flex flex-col
        transform transition-transform duration-300 ease-in-out font-sans shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Icons.BookOpen className="text-blue-500" size={24} />
              <span>CTE | Módulos DB</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">
              Gestión Técnica Edificación
            </p>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <Icons.X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="py-2">
            {CTE_DOCUMENTS.map((doc) => {
              const IconComponent = (Icons as any)[doc.icon] || Icons.FileText;
              const isExpanded = expandedId === doc.id;
              const isActive = currentContext === doc.id;

              return (
                <div key={doc.id} className="border-b border-slate-800/50 last:border-0">
                  {/* Main Accordion Header */}
                  <button
                    onClick={() => toggleExpand(doc.id)}
                    className={`
                      w-full flex items-center justify-between p-4 transition-all duration-200 text-left relative
                      ${isActive 
                        ? 'bg-slate-800 text-white' 
                        : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}
                    `}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                    
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm tracking-tight">{doc.subtitle}</span>
                          <span className="text-xs opacity-50">|</span>
                          <span className="font-medium text-sm truncate w-36">{doc.title}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Icons.ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-400' : 'text-slate-600'}`} 
                    />
                  </button>

                  {/* Accordion Body (Sub-items) */}
                  <div 
                    className={`
                      overflow-hidden transition-all duration-300 bg-slate-950/30
                      ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="py-2 pl-12 pr-4 space-y-1">
                      {doc.subItems?.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onContextChange(doc.id);
                            if (window.innerWidth < 768) onClose();
                          }}
                          className="w-full text-left py-2 px-3 rounded text-xs text-slate-400 hover:text-blue-300 hover:bg-slate-800/50 transition-colors flex items-start group"
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 mr-2 group-hover:bg-blue-500 transition-colors"></span>
                          <span className="leading-tight">{item}</span>
                        </button>
                      ))}
                      
                      {/* Description footnote */}
                      <p className="px-3 py-3 text-[10px] text-slate-600 italic border-t border-slate-800/50 mt-2">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span>Sistema CTE v1.0.4 conectado</span>
          </div>
        </div>
      </div>
    </>
  );
};