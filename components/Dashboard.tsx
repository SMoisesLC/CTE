
import React from 'react';
import { CTELogo } from './CTELogo';
import { BookOpen, FolderOpen, History, Plus, HardHat } from 'lucide-react';

interface DashboardProps {
  onAction: (action: 'NEW' | 'BROWSE' | 'PROJECTS' | 'HISTORY') => void;
  activeProjectName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAction, activeProjectName }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* LOGO & BRANDING */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-2xl shadow-xl mb-6 ring-4 ring-slate-200">
             <CTELogo className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-technical-title">
            CTE <span className="font-light text-slate-500">Expert AI</span>
          </h1>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
            Asistente técnico avanzado para la justificación normativa. 
            <br/>Calcula, verifica y gestiona el cumplimiento del Código Técnico de la Edificación.
          </p>

          {activeProjectName && (
             <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-bold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Expediente Activo: {activeProjectName}
             </div>
          )}
        </div>

        {/* ACTION CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          
          {/* CARD 1: NUEVA CONSULTA */}
          <button 
            onClick={() => onAction('NEW')}
            className="group relative p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all text-left flex items-start gap-5"
          >
            <div className="p-3 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <HardHat size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Nueva Consulta Técnica</h3>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                Inicia una consulta al motor experto. Cálculos, verificaciones y redacción de justificaciones.
              </p>
            </div>
          </button>

          {/* CARD 2: BUSCAR NORMATIVA */}
          <button 
            onClick={() => onAction('BROWSE')}
            className="group relative p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-sky-400 transition-all text-left flex items-start gap-5"
          >
            <div className="p-3 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">Buscar en Normativa</h3>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                Explora los Documentos Básicos (DB), anejos y artículos oficiales directamente.
              </p>
            </div>
          </button>

          {/* CARD 3: PROYECTOS */}
          <button 
            onClick={() => onAction('PROJECTS')}
            className="group relative p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-400 transition-all text-left flex items-start gap-5"
          >
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <FolderOpen size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Gestión de Expedientes</h3>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                Accede a tus proyectos, organiza fichas y revisa el estado de cumplimiento.
              </p>
            </div>
          </button>

          {/* CARD 4: HISTORIAL */}
          <button 
            onClick={() => onAction('HISTORY')}
            className="group relative p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all text-left flex items-start gap-5"
          >
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <History size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">Historial de Consultas</h3>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                Recupera cálculos anteriores y reutiliza justificaciones generadas previamente.
              </p>
            </div>
          </button>

        </div>

        <div className="mt-12 text-center text-xs text-slate-400 font-mono">
           <p>Módulo de Verificación Automática v2.4.0 PRO</p>
           <p className="mt-1">© 2026 CTE Expert AI. Conforme a la última actualización del BOE.</p>
        </div>

      </div>
    </div>
  );
};
