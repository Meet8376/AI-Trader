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
  vwap: number;
  trend: string;
}
