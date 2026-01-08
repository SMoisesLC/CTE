
import React, { useState, useEffect, useMemo } from 'react';
import { CTE_DOCUMENTS } from '../constants';
import { SidebarItem } from './SidebarItem';
import { CTEContext, DBInfo, HistoryEntry, Project } from '../types';
import * as Icons from 'lucide-react';
import { CTELogo } from './CTELogo';
import { ChevronDown, ChevronRight, LayoutGrid, HardHat, ShieldCheck, Zap, Search, History, Check, BookOpen, Trash2, FolderOpen, Plus, Folder } from 'lucide-react';

export type SidebarTab = 'normativa' | 'historial' | 'proyectos';

interface SidebarProps {
  activeContextId: CTEContext;
  onContextChange: (id: CTEContext) => void;
  onAction?: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
  
  // PROPS PARA HISTORIAL Y PROYECTOS
  history?: HistoryEntry[];
  onLoadHistory?: (entry: HistoryEntry) => void;
  onDeleteHistory?: (id: string) => void;
  
  projects?: Project[];
  activeProjectId?: string | null;
  onCreateProject?: (name: string) => void;
  onDeleteProject?: (id: string) => void;
  onActivateProject?: (id: string | null) => void;

  // NUEVO: Control externo de pestañas
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

const CATEGORIES = [
  {
    id: 'CAT_GEN',
    title: 'Parte I: General',
    icon: LayoutGrid,
    docs: [CTEContext.GENERAL]
  },
  {
    id: 'CAT_SE',
    title: 'Seguridad Estructural (SE)',
    icon: HardHat,
    docs: [
      CTEContext.DB_SE_AE, 
      CTEContext.DB_SE_C, 
      CTEContext.DB_SE_A, 
      CTEContext.DB_SE_F, 
      CTEContext.DB_SE_M
    ]
  },
  {
    id: 'CAT_SEG',
    title: 'Seguridad (SI / SUA)',
    icon: ShieldCheck,
    docs: [CTEContext.DB_SI, CTEContext.DB_SUA]
  },
  {
    id: 'CAT_HAB',
    title: 'Habitabilidad (HS / HE / HR)',
    icon: Zap,
    docs: [CTEContext.DB_HS, CTEContext.DB_HE, CTEContext.DB_HR]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeContextId, 
  onContextChange, 
  onAction, 
  isOpen, 
  onClose,
  history = [],
  onLoadHistory,
  onDeleteHistory,
  projects = [],
  activeProjectId,
  onCreateProject,
  onDeleteProject,
  onActivateProject,
  activeTab,
  onTabChange
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [normativeVersion, setNormativeVersion] = useState('2022');
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  // Proyecto seleccionado para VER su contenido (no necesariamente el activo para nuevas consultas)
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);

  useEffect(() => {
    const activeCat = CATEGORIES.find(cat => cat.docs.includes(activeContextId));
    if (activeCat) {
      setOpenCategories(prev => ({
        ...prev,
        [activeCat.id]: true
      }));
    }
  }, [activeContextId]);

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleSidebarInteraction = (docId: CTEContext, actionPrompt?: string) => {
    onContextChange(docId);
    if (actionPrompt && onAction) {
       onAction(actionPrompt);
    }
    if (window.innerWidth < 768) onClose();
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim() && onCreateProject) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingProject(false);
    }
  };

  // --- LÓGICA DE BÚSQUEDA INTELIGENTE (NORMATIVA) ---
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return CATEGORIES;
    const lowerTerm = searchTerm.toLowerCase();

    return CATEGORIES.map(cat => {
      const matchedDocs = cat.docs.filter(docId => {
        const doc = CTE_DOCUMENTS.find(d => d.id === docId);
        if (!doc) return false;
        if (doc.title.toLowerCase().includes(lowerTerm) || doc.description.toLowerCase().includes(lowerTerm)) return true;
        const hasMatchedSubItems = doc.subItems.some(sub => 
          sub.title.toLowerCase().includes(lowerTerm) || 
          sub.description.toLowerCase().includes(lowerTerm) ||
          sub.actions?.some(act => act.label.toLowerCase().includes(lowerTerm))
        );
        return hasMatchedSubItems;
      });
      return { ...cat, docs: matchedDocs };
    }).filter(cat => cat.docs.length > 0);
  }, [searchTerm]);

  // Si hay búsqueda, expandimos todo automáticamente
  useEffect(() => {
    if (searchTerm && activeTab === 'normativa') {
      const allOpen: Record<string, boolean> = {};
      filteredCategories.forEach(cat => { allOpen[cat.id] = true; });
      setOpenCategories(allOpen);
    }
  }, [searchTerm, filteredCategories, activeTab]);

  // --- Agrupación de historial GLOBAL (para pestaña Historial) ---
  const globalHistoryGrouped = useMemo(() => {
    const grouped: Record<string, HistoryEntry[]> = {};
    history.forEach(entry => {
      if (!grouped[entry.context]) grouped[entry.context] = [];
      grouped[entry.context].push(entry);
    });
    Object.keys(grouped).forEach(key => grouped[key].sort((a, b) => b.timestamp - a.timestamp));
    return grouped;
  }, [history]);

  // --- Agrupación de historial por PROYECTO (para pestaña Proyectos) ---
  const projectHistoryGrouped = useMemo(() => {
    if (!viewingProjectId) return {};
    const grouped: Record<string, HistoryEntry[]> = {};
    
    history
      .filter(h => h.projectId === viewingProjectId)
      .forEach(entry => {
        if (!grouped[entry.context]) grouped[entry.context] = [];
        grouped[entry.context].push(entry);
      });
      
    Object.keys(grouped).forEach(key => grouped[key].sort((a, b) => b.timestamp - a.timestamp));
    return grouped;
  }, [history, viewingProjectId]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-[26rem] h-screen bg-[#020617] flex flex-col border-r border-slate-800 shadow-2xl overflow-hidden font-technical-title
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* HEADER & BRAND */}
        <div className="p-5 border-b border-slate-800 bg-[#020617] z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CTELogo className="w-10 h-10 shrink-0" />
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                  CTE <span className="font-light text-slate-400">Expert AI</span>
                </h1>
                <div className="flex items-center gap-1 mt-1">
                   <span className="bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/20 font-bold tracking-wider">PRO</span>
                   <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Arquitectura</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
              <Icons.X size={24} />
            </button>
          </div>

          {/* TABS DE NAVEGACIÓN */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
             <button 
               onClick={() => onTabChange('normativa')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                 activeTab === 'normativa' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <BookOpen size={14} />
                Normas
             </button>
             <button 
               onClick={() => onTabChange('proyectos')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                 activeTab === 'proyectos' ? 'bg-slate-800 text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <FolderOpen size={14} />
                Proyectos
             </button>
             <button 
               onClick={() => onTabChange('historial')}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                 activeTab === 'historial' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <History size={14} />
                Historial
             </button>
          </div>

          {/* BUSCADOR (Solo Normativa) */}
          {activeTab === 'normativa' && (
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                <Search size={14} />
                </div>
                <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar (ej. ventilación, nieve...)"
                className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-600"
                />
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          
          {/* --- VISTA NORMATIVA --- */}
          {activeTab === 'normativa' && (
            <>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                    const isOpen = openCategories[cat.id];
                    const CatIcon = cat.icon;

                    return (
                        <div key={cat.id} className="rounded-xl overflow-hidden border border-transparent">
                        <button 
                            onClick={() => toggleCategory(cat.id)}
                            className={`w-full flex items-center justify-between p-3 transition-colors ${
                            cat.docs.some(d => d === activeContextId) ? 'bg-slate-900 text-amber-500' : 'bg-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                            <CatIcon size={18} />
                            <span className="text-sm font-semibold uppercase tracking-wide">{cat.title}</span>
                            </div>
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isOpen && (
                            <div className="bg-slate-950/30 p-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            {cat.docs.map(docId => {
                                const doc = CTE_DOCUMENTS.find(d => d.id === docId);
                                if (!doc) return null;
                                
                                return (
                                <SidebarItem 
                                    key={doc.id}
                                    doc={doc}
                                    isActive={activeContextId === doc.id}
                                    onActivateContext={(prompt) => handleSidebarInteraction(doc.id, prompt)}
                                />
                                );
                            })}
                            </div>
                        )}
                        </div>
                    );
                    })
                ) : (
                    <div className="text-center py-10 text-slate-500 text-sm">
                    <p>No se encontraron resultados.</p>
                    </div>
                )}
            </>
          )}

          {/* --- VISTA PROYECTOS --- */}
          {activeTab === 'proyectos' && (
             <div className="space-y-4">
                 
                 {/* Creación de proyecto */}
                 {!isCreatingProject ? (
                    <button 
                      onClick={() => setIsCreatingProject(true)}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-slate-900/50 transition-all text-xs uppercase font-bold tracking-wide"
                    >
                        <Plus size={16} />
                        Nuevo Expediente
                    </button>
                 ) : (
                     <form onSubmit={handleCreateProjectSubmit} className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Nombre del Proyecto</p>
                         <input 
                           type="text" 
                           autoFocus
                           value={newProjectName}
                           onChange={e => setNewProjectName(e.target.value)}
                           placeholder="Ej. Vivienda Unifamiliar Burgos"
                           className="w-full bg-slate-950 border border-slate-700 rounded text-xs p-2 text-white focus:outline-none focus:border-amber-500 mb-2"
                         />
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => setIsCreatingProject(false)} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1">Cancelar</button>
                             <button type="submit" disabled={!newProjectName.trim()} className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-500 disabled:opacity-50 font-bold">Crear</button>
                         </div>
                     </form>
                 )}

                 {/* Lista de proyectos */}
                 <div className="space-y-2">
                     {projects.length === 0 && !isCreatingProject ? (
                        <div className="text-center py-8 text-slate-600 text-xs">
                           <Folder size={24} className="mx-auto mb-2 opacity-50"/>
                           <p>Sin expedientes activos</p>
                        </div>
                     ) : (
                        projects.map(proj => {
                            const isExpanded = viewingProjectId === proj.id;
                            const isActive = activeProjectId === proj.id;
                            
                            return (
                                <div key={proj.id} className={`rounded-lg border transition-all ${isExpanded ? 'bg-slate-900 border-slate-700' : 'bg-transparent border-slate-800 hover:border-slate-700'}`}>
                                    <div 
                                      className="flex items-center justify-between p-3 cursor-pointer"
                                      onClick={() => setViewingProjectId(isExpanded ? null : proj.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded ${isActive ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                                                <Folder size={16} fill={isActive ? "currentColor" : "none"} />
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{proj.name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{new Date(proj.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isExpanded ? <ChevronDown size={14} className="text-slate-500"/> : <ChevronRight size={14} className="text-slate-500"/>}
                                        </div>
                                    </div>
                                    
                                    {/* Panel de control del proyecto */}
                                    {isExpanded && (
                                        <div className="px-3 pb-3 pt-1 border-t border-slate-800/50">
                                            <div className="flex gap-2 mb-3 mt-1">
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); onActivateProject && onActivateProject(isActive ? null : proj.id); }}
                                                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                                      isActive 
                                                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                                                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                                  }`}
                                                >
                                                    <Check size={12} className={isActive ? "opacity-100" : "opacity-0"} />
                                                    {isActive ? 'Activo' : 'Activar'}
                                                </button>
                                                <button 
                                                  onClick={(e) => { 
                                                      e.stopPropagation(); 
                                                      if(window.confirm('¿Eliminar expediente y sus fichas?')) onDeleteProject && onDeleteProject(proj.id); 
                                                  }}
                                                  className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-900/50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Historial del proyecto agrupado */}
                                            {Object.keys(projectHistoryGrouped).length > 0 ? (
                                                Object.entries(projectHistoryGrouped).map(([ctxKey, entries]) => (
                                                    <div key={ctxKey} className="ml-1 pl-3 border-l border-slate-800 mt-3">
                                                        <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-1">{ctxKey}</h4>
                                                        <div className="space-y-1">
                                                            {entries.map(entry => (
                                                                <div 
                                                                    key={entry.id}
                                                                    onClick={() => onLoadHistory && onLoadHistory(entry)}
                                                                    className="text-[11px] text-slate-400 hover:text-amber-400 cursor-pointer truncate py-1 hover:bg-slate-800/50 rounded px-1 transition-colors"
                                                                >
                                                                    • {entry.query}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-slate-600 italic text-center py-2">Sin fichas archivadas.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                     )}
                 </div>
             </div>
          )}

          {/* --- VISTA HISTORIAL (GLOBAL) --- */}
          {activeTab === 'historial' && (
            <div className="space-y-6">
               {Object.keys(globalHistoryGrouped).length === 0 ? (
                   <div className="text-center py-12 px-4">
                       <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                           <History size={24} />
                       </div>
                       <p className="text-slate-400 text-sm font-medium">Registro global vacío.</p>
                       <p className="text-slate-600 text-xs mt-1">Todas tus consultas aparecerán aquí cronológicamente.</p>
                   </div>
               ) : (
                   Object.entries(globalHistoryGrouped).map(([ctxKey, entries]) => {
                       const doc = CTE_DOCUMENTS.find(d => d.id === ctxKey);
                       const title = doc ? doc.subtitle : ctxKey;
                       
                       return (
                           <div key={ctxKey} className="relative pl-4 border-l border-slate-800">
                               <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-sky-600 border-2 border-[#020617]"></div>
                               <h3 className="text-sky-500 font-bold text-xs uppercase tracking-wider mb-3 pl-1">{title}</h3>
                               
                               <div className="space-y-2">
                                   {entries.map(entry => (
                                       <div 
                                         key={entry.id}
                                         className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-lg p-3 group transition-all cursor-pointer relative"
                                         onClick={() => onLoadHistory && onLoadHistory(entry)}
                                       >
                                           <div className="flex justify-between items-start gap-2">
                                               <p className="text-slate-300 text-xs font-medium leading-relaxed line-clamp-2 pr-6">
                                                   {entry.query}
                                               </p>
                                               <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      if(onDeleteHistory) onDeleteHistory(entry.id);
                                                  }}
                                                  className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-opacity p-1"
                                               >
                                                   <Trash2 size={12} />
                                               </button>
                                           </div>
                                           <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                               <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                                               
                                               {/* Si tiene proyecto, mostrar tag */}
                                               {entry.projectId && (
                                                   <span className="bg-slate-800 text-amber-500 px-1.5 rounded border border-slate-700 ml-auto">
                                                       PROJ
                                                   </span>
                                               )}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       );
                   })
               )}
            </div>
          )}

        </div>

        {/* FOOTER - VERSION CONTROL */}
        <div className="p-4 border-t border-slate-800 bg-[#020617] space-y-3">
          
          {/* Version Selector */}
          <div className="bg-slate-900 rounded-lg p-2 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <History size={14} />
              <span className="text-[10px] uppercase font-bold tracking-wider">Versión</span>
            </div>
            <select 
              value={normativeVersion}
              onChange={(e) => setNormativeVersion(e.target.value)}
              className="bg-transparent text-xs text-emerald-500 font-bold focus:outline-none cursor-pointer text-right"
            >
              <option value="2022">Vigente (Consolidado 2022)</option>
              <option value="2019">Histórico (2019)</option>
              <option value="2006">Original (2006)</option>
            </select>
          </div>

          <div className="flex justify-between items-center pl-1">
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">v2.4.0 PRO</span>
             </div>
             <a href="https://www.boe.es" target="_blank" rel="noreferrer" className="text-[10px] text-sky-700 hover:text-sky-500 transition-colors">
               Fuente: Agencia BOE
             </a>
          </div>
        </div>
      </aside>
    </>
  );
};
