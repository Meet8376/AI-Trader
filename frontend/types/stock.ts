export type TradingMode = 'intraday' | 'long-term';

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  market_cap?: string;
  pe_ratio?: number;
  day_range?: string;
  sector?: string;
  exchange?: string;
}

export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  open: number;
  sparkline?: number[];
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  ema_20: number;
  ema_50: number;
  ema_200?: number;
  vwap: number;
  pivot?: number;
  resistance_1?: number;
  support_1?: number;
  atr?: number;
  supertrend?: string;
  trend: string;
}

export interface PortfolioPosition {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  type: 'BUY' | 'SELL';
  mode: TradingMode;
  date: string;
}

export interface TradeRecord {
  id: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
  mode: TradingMode;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  summary: string;
  category: 'ALL' | 'NSE' | 'BSE' | 'RESULTS' | 'IPO' | 'MACRO';
  tickers?: string[];
}

export interface ScreenerFilter {
  minPrice?: number;
  maxPrice?: number;
  minPe?: number;
  maxPe?: number;
  minRsi?: number;
  maxRsi?: number;
  minMarketCap?: number;
  sector?: string;
  signal?: string;
}
