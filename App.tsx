import React, { useState, useEffect, useRef } from 'react';
import { Sender, ChatMessage, LegalDomain } from './types';
import { initializeChat, sendMessageStream } from './services/geminiService';
import { DOMAIN_OPTIONS, APP_NAME } from './constants';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { LegalDisclaimer } from './components/LegalDisclaimer';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<LegalDomain>(LegalDomain.General);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    if (disclaimerAccepted && messages.length === 0) {
      setMessages([{
        id: 'init-1',
        role: Sender.AI,
        content: `您好，我是${APP_NAME}。作为您的私人顶级律师，我精通《民法典》、《刑法》、《公司法》等中国核心法律法规，并能结合最新司法解释为您提供专业咨询。\n\n请问您今天遇到什么法律问题？(建议您提供具体的案情背景，例如：合同纠纷、婚姻财产、刑事辩护等)`,
        timestamp: Date.now()
      }]);
    }
  }, [disclaimerAccepted, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Sender.User,
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Contextualize input with domain if not general
    const prompt = selectedDomain === LegalDomain.General 
      ? input 
      : `[领域: ${selectedDomain}] ${input}`;

    try {
        const aiMsgId = (Date.now() + 1).toString();
        let fullResponse = "";
        let collectedCitations: string[] = [];
        
        // Placeholder message for streaming
        setMessages(prev => [...prev, {
            id: aiMsgId,
            role: Sender.AI,
            content: "正在查阅法条与案例...",
            timestamp: Date.now(),
            isStreaming: true
        }]);

        await sendMessageStream(prompt, (chunk, citations) => {
            fullResponse += chunk;
            if (citations) {
                // Merge unique citations
                citations.forEach(c => {
                    if (!collectedCitations.includes(c)) collectedCitations.push(c);
                });
            }
            
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId 
                ? { ...msg, content: fullResponse, citations: collectedCitations, isStreaming: true } 
                : msg
            ));
        });

        // Finalize
        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        ));

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: Sender.AI,
            content: "抱歉，系统遇到技术问题，请稍后重试。\nError: " + (error instanceof Error ? error.message : String(error)),
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!disclaimerAccepted) {
    return <LegalDisclaimer onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="flex h-screen bg-legal-50 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col bg-legal-900 text-slate-300 border-r border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-legal-gold flex items-center justify-center text-legal-900 text-xl font-bold font-serif">
                法
            </div>
            <div>
                <h1 className="text-white font-serif font-bold text-lg">{APP_NAME}</h1>
                <p className="text-xs text-legal-gold">私人顶级律师顾问</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">咨询领域 / Domains</h3>
            <div className="space-y-1">
                {DOMAIN_OPTIONS.map((domain) => (
                    <button
                        key={domain.id}
                        onClick={() => setSelectedDomain(domain.id as LegalDomain)}
                        className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 text-sm transition-all
                            ${selectedDomain === domain.id 
                                ? 'bg-legal-700 text-white shadow-md border-l-4 border-legal-gold' 
                                : 'hover:bg-legal-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        <span>{domain.icon}</span>
                        <span>{domain.id}</span>
                    </button>
                ))}
            </div>
            
            <div className="mt-8 p-4 bg-legal-800 rounded-lg border border-legal-700 text-xs text-slate-400">
                <h4 className="text-legal-gold mb-2 font-bold">知识库涵盖:</h4>
                <p className="leading-relaxed">宪法、民法典、刑法、公司法、劳动法、行政法及 flk.npc.gov.cn 案例库。</p>
            </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-legal-900 text-white p-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-2">
                <span className="text-legal-gold font-serif text-xl">⚖️</span>
                <span className="font-serif font-bold">{APP_NAME}</span>
            </div>
            <select 
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value as LegalDomain)}
                className="bg-legal-800 text-xs p-1 rounded border border-legal-700 focus:outline-none"
            >
                {DOMAIN_OPTIONS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
            </select>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 relative scrollbar-hide">
            <div className="max-w-4xl mx-auto w-full pb-4">
                {messages.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4 md:p-6 shadow-lg z-20">
            <div className="max-w-4xl mx-auto w-full relative">
                <div className="flex gap-2 items-end bg-white border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-legal-400 focus-within:border-transparent transition-all shadow-sm">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="请输入您的法律问题 (支持引用具体法条)..."
                        className="flex-1 max-h-32 min-h-[24px] bg-transparent border-none focus:ring-0 resize-none text-slate-700 placeholder:text-slate-400 text-sm md:text-base py-1"
                        rows={1}
                        style={{ height: 'auto', minHeight: '1.5em' }} 
                        // Simple auto-grow
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className={`p-2 rounded-full flex-shrink-0 transition-colors duration-200
                            ${isLoading || !input.trim() 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-legal-900 text-legal-gold hover:bg-slate-800 shadow-md'
                            }`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400">
                        LawGPT生成内容可能不准确，请参考《中华人民共和国》相关法律法规原文。仅限咨询，不代表法律判决。
                    </p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
