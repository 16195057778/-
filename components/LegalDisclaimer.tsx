import React from 'react';

interface Props {
  onAccept: () => void;
}

export const LegalDisclaimer: React.FC<Props> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 border-t-4 border-legal-gold">
        <div className="text-center mb-6">
          <span className="text-4xl">⚖️</span>
          <h2 className="text-2xl font-serif font-bold text-slate-800 mt-4">免责声明 / Disclaimer</h2>
        </div>
        
        <div className="prose prose-slate text-sm text-slate-600 mb-6 max-h-60 overflow-y-auto bg-slate-50 p-4 rounded border border-slate-200">
          <p className="mb-2"><strong>请仔细阅读：</strong></p>
          <p className="mb-2">
            "智法 LawGPT" 是一个基于人工智能的法律咨询辅助工具。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本系统的回复仅供参考，<strong>不构成</strong>正式的法律意见或律师函。</li>
            <li>法律法规实时更新，AI 可能存在滞后性或幻觉，请务必核实《中华人民共和国民法典》等原文。</li>
            <li>对于重大法律纠纷、诉讼或商业决策，请务必咨询持有执业资格证书的律师。</li>
            <li>本服务不承担因使用本工具而产生的任何直接或间接法律责任。</li>
          </ul>
        </div>

        <button 
          onClick={onAccept}
          className="w-full bg-legal-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          我已阅读并同意 / I Agree
        </button>
      </div>
    </div>
  );
};
