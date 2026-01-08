import React from 'react';

interface LoadingIndicatorProps {
  text: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text }) => (
  <div className="flex items-center gap-3 p-4 mb-6 ml-4 max-w-[90%] md:max-w-[80%] text-slate-600 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-sm font-mono italic text-slate-500">{text}</span>
  </div>
);