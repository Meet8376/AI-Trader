import { StockQuote, CandleData, TechnicalIndicators, TradingMode } from '../types/stock';
import { AgentOpinion, DebateVerdict, TopPick } from '../types/debate';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchStocks(): Promise<StockQuote[]> {
  const res = await fetch(`${API_BASE_URL}/api/stocks`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stocks');
  return res.json();
}

export async function fetchStockCandles(ticker: string, timeframe: string = '15m'): Promise<{
  ticker: string;
  timeframe: string;
  candles: CandleData[];
  indicators: TechnicalIndicators;
}> {
  const res = await fetch(`${API_BASE_URL}/api/stocks/${ticker}/candles?timeframe=${timeframe}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch candles for ${ticker}`);
  return res.json();
}

export async function analyzeStock(ticker: string, mode: TradingMode): Promise<{
  ticker: string;
  mode: TradingMode;
  opinions: AgentOpinion[];
  verdict: DebateVerdict;
}> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticker, mode }),
  });
  if (!res.ok) throw new Error(`Failed to run debate for ${ticker}`);
  return res.json();
}

export async function fetchTopPicks(mode: TradingMode): Promise<TopPick[]> {
  const res = await fetch(`${API_BASE_URL}/api/recommendations?mode=${mode}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch top picks');
  const data = await res.json();
  return data.top_picks;
}
