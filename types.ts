export enum Sender {
  User = 'USER',
  AI = 'AI',
  System = 'SYSTEM'
}

export interface ChatMessage {
  id: string;
  role: Sender;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  citations?: string[]; // URLs from grounding
}

export interface LegalCase {
  title: string;
  summary: string;
  url?: string;
}

export enum LegalDomain {
  General = '综合咨询',
  Civil = '民事/婚姻/继承',
  Criminal = '刑事辩护',
  Commercial = '公司/合同/破产',
  Admin = '行政/国家赔偿',
  IP = '知识产权'
}
