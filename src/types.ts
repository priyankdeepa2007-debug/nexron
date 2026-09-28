export type ScreenId =
  | 'capture-grade'
  | 'buyer-recheck'
  | 'ledger-and-cryptography'
  | 'agent-reputation';

export type UserRole = 'agent' | 'buyer' | 'auditor';

export interface LotRecord {
  id: string;
  blockNumber: number;
  farmer: string;
  village: string;
  commodity: string;
  quantityKg: number;
  grade: string;
  sumScore: number;
  hash: string;
  timestamp: string;
  agentName: string;
  agentId: string;
  status: 'PENDING_BUYER' | 'IN_DISPUTE' | 'VERIFIED_MATCH' | 'RESOLVED';
  attributeScores: {
    size: number;
    colour: number;
    moisture: number;
    defects: number;
  };
}

export interface ChainBlock {
  index: number;
  type: 'GENESIS' | 'GRADE_LOCKED' | 'RECHECK' | 'DISPUTE_RESOLVED';
  lotId: string;
  prevHash: string;
  hash: string;
  timestamp: string;
  payload: Record<string, any>;
}

export interface AssayerInfo {
  id: string;
  name: string;
  role: string;
  mandi: string;
  rating: number;
  accuracy: string;
  tier: string;
  confirmedCount: number;
  totalAssayed: number;
  assayedMT: number;
  history: ('MATCH' | 'MINOR' | 'MISMATCH' | 'RESOLVED')[];
  analysis: string;
  avatarUrl: string;
  status: 'verified' | 'recovered' | 'review';
}
