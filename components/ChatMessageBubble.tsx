import React from 'react';
import { ChatMessage, Sender } from '../types';

interface Props {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<Props> = ({ message }) => {
  const isAI = message.role === Sender.AI;

  // Simple formatter to handle bold text (**text**) and basic newlines
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-legal-900 font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isAI ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
          ${isAI ? 'bg-legal-900 text-legal-gold border border-legal-gold' : 'bg-slate-200 text-slate-600'}`}>
          {isAI ? '法' : '我'}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed
            ${isAI 
              ? 'bg-white text-slate-800 border border-slate-100 font-serif' 
              : 'bg-legal-600 text-white font-sans'
            }`}>
            {isAI ? (
               <div className="space-y-2">
                 {formatText(message.content)}
               </div>
            ) : (
               message.content
            )}
          </div>
          
          {/* Citations / Sources */}
          {isAI && message.citations && message.citations.length > 0 && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 w-full">
              <span className="font-semibold text-legal-gold block mb-1">参考来源 / Sources:</span>
              <ul className="list-disc pl-4 space-y-1">
                {message.citations.map((cite, idx) => (
                  <li key={idx} className="truncate max-w-xs hover:text-legal-700">
                    <a href={cite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {cite}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timestamp */}
          <span className="text-[10px] text-slate-400 mt-1 px-1">
             {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
};
