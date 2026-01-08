import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { Bot, User, FileText, ExternalLink, Paperclip } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mx-3 ${
          isModel ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isModel ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col overflow-hidden rounded-2xl shadow-sm ${
          isModel 
            ? 'bg-white border border-slate-100' 
            : 'bg-blue-600 text-white'
        }`}>
          
          {/* Attachment Preview (if User sent one) */}
          {message.attachment && (
            <div className={`px-4 py-3 border-b ${isModel ? 'border-slate-100 bg-slate-50' : 'border-blue-500 bg-blue-700/50'}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Paperclip size={14} />
                <span className="truncate max-w-[200px]">{message.attachment.name}</span>
                <span className="text-xs opacity-70 ml-1 uppercase border border-current px-1 rounded">
                  {message.attachment.mimeType.split('/')[1]}
                </span>
              </div>
            </div>
          )}

          <div className={`px-6 py-4 markdown-body text-sm ${!isModel && 'text-white'}`}>
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
            {message.isStreaming && (
               <span className="inline-block w-2 h-4 ml-1 bg-current opacity-50 animate-pulse"/>
            )}
          </div>

          {/* Grounding Sources */}
          {message.groundingMetadata && message.groundingMetadata.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center">
                <FileText size={12} className="mr-1" />
                Fuentes consultadas:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.groundingMetadata.map((chunk, idx) => (
                  chunk.web ? (
                    <a 
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                    >
                      <span className="truncate mr-1">{chunk.web.title}</span>
                      <ExternalLink size={10} />
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};