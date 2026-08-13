import { TradingMode } from './stock';

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface AgentOpinion {
  agent_id: string;
  agent_name: string;
  role: string;
  avatar: string;
  signal: SignalType;
  confidence: number;
  key_points: string[];
  technical_targets?: {
    entry: number;
    target_1: number;
    target_2: number;
    stop_loss: number;
  };
  full_argument: string;
}

export interface DebateVerdict {
  ticker: string;
  mode: TradingMode;
  verdict: SignalType;
  confidence: number;
  consensus_score: number;
  target_price: number;
  stop_loss: number;
  risk_reward_ratio?: number;
  horizon: string;
  summary: string;
  bull_case: string;
  bear_case: string;
}

export interface TopPick {
  rank: number;
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  consensus_score: number;
  signal: string;
  rationale: string;
  target_price: number;
  stop_loss: number;
}
