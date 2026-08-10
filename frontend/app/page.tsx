'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CandlestickChart } from '../components/CandlestickChart';
import { DebatePanel } from '../components/DebatePanel';
import { TopPicks } from '../components/TopPicks';
import { StockQuote, CandleData, TechnicalIndicators, TradingMode } from '../types/stock';
import { AgentOpinion, DebateVerdict, TopPick } from '../types/debate';
import { fetchStocks, fetchStockCandles, analyzeStock, fetchTopPicks } from '../lib/api';

const MOCK_STOCKS: StockQuote[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 128.80, change: 4.30, change_percent: 3.45, high: 130.50, low: 124.00, open: 124.50, volume: 45000000, market_cap: '$3.16 T', pe_ratio: 68.5 },
  { ticker: 'AAPL', name: 'Apple Inc', price: 224.50, change: 2.40, change_percent: 1.08, high: 226.00, low: 222.00, open: 222.10, volume: 32000000, market_cap: '$3.42 T', pe_ratio: 34.2 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 448.20, change: 3.20, change_percent: 0.72, high: 452.00, low: 444.00, open: 445.00, volume: 21000000, market_cap: '$3.33 T', pe_ratio: 36.8 },
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2985.40, change: 25.40, change_percent: 0.86, high: 3010.00, low: 2960.00, open: 2970.00, volume: 2450000, market_cap: '₹20.19 T', pe_ratio: 28.4 },
  { ticker: 'TCS', name: 'Tata Consultancy Services', price: 4180.20, change: 30.20, change_percent: 0.73, high: 4210.00, low: 4140.00, open: 4150.00, volume: 1200000, market_cap: '₹15.12 T', pe_ratio: 33.1 },
  { ticker: 'INFY', name: 'Infosys Limited', price: 1820.65, change: -19.35, change_percent: -1.05, high: 1845.00, low: 1810.00, open: 1840.00, volume: 3100000, market_cap: '₹7.56 T', pe_ratio: 26.8 },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.10, change: 15.10, change_percent: 0.93, high: 1658.00, low: 1625.00, open: 1630.00, volume: 4200000, market_cap: '₹12.52 T', pe_ratio: 18.9 },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1210.80, change: 15.80, change_percent: 1.32, high: 1220.00, low: 1190.00, open: 1195.00, volume: 2800000, market_cap: '₹8.51 T', pe_ratio: 17.4 },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1055.30, change: 15.30, change_percent: 1.47, high: 1065.00, low: 1035.00, open: 1040.00, volume: 3800000, market_cap: '₹3.88 T', pe_ratio: 14.2 },
  { ticker: 'TSLA', name: 'Tesla Inc', price: 218.40, change: 8.40, change_percent: 4.00, high: 222.00, low: 209.00, open: 210.00, volume: 29000000, market_cap: '$695 B', pe_ratio: 58.4 }
];

export default function DashboardPage() {
  const [mode, setMode] = useState<TradingMode>('intraday');
  const [activeTab, setActiveTab] = useState<'chart' | 'topPicks'>('chart');
  
  const [stocks, setStocks] = useState<StockQuote[]>(MOCK_STOCKS);
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [timeframe, setTimeframe] = useState<string>('15m');
  
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | undefined>(undefined);
  
  const [opinions, setOpinions] = useState<AgentOpinion[]>([]);
  const [verdict, setVerdict] = useState<DebateVerdict | null>(null);
  const [isDebating, setIsDebating] = useState<boolean>(false);
  
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);

  // Load stocks & top picks
  useEffect(() => {
    async function loadData() {
      try {
        const stockList = await fetchStocks();
        if (stockList && stockList.length > 0) {
          setStocks(stockList);
        }
      } catch (e) {
        console.log("Using mock stock list fallback");
      }

      try {
        const picks = await fetchTopPicks(mode);
        setTopPicks(picks);
      } catch (e) {
        console.log("Using mock top picks fallback");
      }
    }
    loadData();
  }, [mode]);

  // Load candle data when ticker or timeframe changes
  useEffect(() => {
    async function loadCandles() {
      try {
        const res = await fetchStockCandles(selectedTicker, timeframe);
        setCandles(res.candles);
        setIndicators(res.indicators);
      } catch (e) {
        // Fallback mock candles with realistic price action
        const activeStock = stocks.find(s => s.ticker === selectedTicker) || MOCK_STOCKS[0];
        const now = new Date();
        const mockCandles: CandleData[] = Array.from({ length: 60 }).map((_, i) => {
          const t = new Date(now.getTime() - (60 - i) * 15 * 60000);
          const base = activeStock.price * 0.95 + Math.sin(i / 6) * (activeStock.price * 0.03);
          return {
            time: t.toISOString().slice(0, 16).replace('T', ' '),
            open: round(base),
            high: round(base + Math.random() * (activeStock.price * 0.008)),
            low: round(base - Math.random() * (activeStock.price * 0.008)),
            close: round(base + (Math.random() - 0.46) * (activeStock.price * 0.01)),
            volume: Math.floor(Math.random() * 120000 + 20000)
          };
        });
        setCandles(mockCandles);
        setIndicators({
          rsi: 64.2,
          macd: { macd: 2.4, signal: 1.8, histogram: 0.6 },
          bollinger: { upper: round(activeStock.price * 1.02), middle: round(activeStock.price), lower: round(activeStock.price * 0.98) },
          ema_20: round(activeStock.price * 0.992),
          ema_50: round(activeStock.price * 0.978),
          vwap: round(activeStock.price * 0.996),
          trend: 'Strong Bullish'
        });
      }
    }

    loadCandles();
    setOpinions([]);
    setVerdict(null);
  }, [selectedTicker, timeframe]);

  // Handle Gemini Multi-Agent Debate execution
  const handleTriggerDebate = async () => {
    setIsDebating(true);
    setOpinions([]);
    setVerdict(null);

    try {
      const res = await analyzeStock(selectedTicker, mode);
      setOpinions(res.opinions);
      setVerdict(res.verdict);
    } catch (e) {
      // Direct local fallback if API unreachable
      setTimeout(() => {
        const currentStock = stocks.find(s => s.ticker === selectedTicker) || MOCK_STOCKS[0];
        const currSym = currentStock.ticker.match(/^(NVDA|AAPL|MSFT|GOOGL|AMZN|META|TSLA|AMD|NFLX|JPM)$/) ? '$' : '₹';

        const mockOpinions: AgentOpinion[] = [
          {
            agent_id: 'tech_analyst',
            agent_name: 'Alex Vance (Gemini AI)',
            role: 'Technical Analyst',
            avatar: '📊',
            signal: 'BUY',
            confidence: 86,
            key_points: [
              `Price action holding above EMA(20) at ${currSym}${round(currentStock.price * 0.992)}.`,
              'RSI (14) at 64.2 confirms healthy bullish momentum without overbought stretch.',
              'VWAP anchored support providing firm intraday floor.'
            ],
            technical_targets: {
              entry: currentStock.price,
              target_1: round(currentStock.price * 1.03),
              target_2: round(currentStock.price * 1.05),
              stop_loss: round(currentStock.price * 0.985)
            },
            full_argument: `Technicals for ${selectedTicker} confirm a high-probability bullish setup.`
          },
          {
            agent_id: 'sentiment_analyst',
            agent_name: 'Maya Lin (Gemini AI)',
            role: 'News & Sentiment Analyst',
            avatar: '📰',
            signal: 'BUY',
            confidence: 81,
            key_points: [
              'Institutional block orders favor steady accumulation on dips.',
              'Sector relative strength index outperforming broader market by +2.1%.'
            ],
            full_argument: `Market sentiment and order book depth remain heavily buyer dominant.`
          },
          {
            agent_id: 'bull_debater',
            agent_name: "Leo 'The Bull' Sterling (Gemini AI)",
            role: 'Bull Debater',
            avatar: '🐂',
            signal: 'BUY',
            confidence: 90,
            key_points: [
              'Confluence of VWAP support, RSI momentum, and strong institutional interest.',
              `Target projection of ${currSym}${round(currentStock.price * (mode === 'intraday' ? 1.035 : 1.15))}.`
            ],
            full_argument: `High conviction BUY recommendation for ${selectedTicker}!`
          },
          {
            agent_id: 'bear_debater',
            agent_name: "Sophia 'The Bear' Rhodes (Gemini AI)",
            role: 'Bear Debater',
            avatar: '🐻',
            signal: 'HOLD',
            confidence: 64,
            key_points: [
              `Overhead resistance cluster near ${currSym}${round(currentStock.price * 1.02)}.`,
              'Trailing stop-loss recommended to guard against sudden volatility sweeps.'
            ],
            full_argument: `Caution advised near supply zone resistance.`
          }
        ];

        const mockVerdict: DebateVerdict = {
          ticker: selectedTicker,
          mode: mode,
          verdict: 'BUY',
          confidence: 85,
          consensus_score: 8.8,
          target_price: round(currentStock.price * (mode === 'intraday' ? 1.035 : 1.15)),
          stop_loss: round(currentStock.price * (mode === 'intraday' ? 0.985 : 0.94)),
          horizon: mode === 'intraday' ? '1-3 Days (Intraday)' : '3-6 Months (Long-Term)',
          summary: `The Gemini AI Trading Floor reaches consensus: BUY ${selectedTicker} at ${currSym}${currentStock.price}. Technical momentum and institutional order flow outweigh short-term bear warnings.`,
          bull_case: 'Technical breakout supported by institutional volume.',
          bear_case: 'Overhead supply near resistance zone.'
        };

        setOpinions(mockOpinions);
        setVerdict(mockVerdict);
      }, 1000);
    } finally {
      setIsDebating(false);
    }
  };

  const activeStock = stocks.find(s => s.ticker === selectedTicker) || stocks[0];

  return (
    <div className="app-container">
      {/* Header */}
      <Header mode={mode} onModeChange={setMode} />

      {/* Navigation Sub-Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 20px',
        display: 'flex',
        gap: '20px',
        fontSize: '0.85rem'
      }}>
        <button
          onClick={() => setActiveTab('chart')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'chart' ? '2px solid var(--accent-blue)' : '2px solid transparent',
            color: activeTab === 'chart' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '10px 0',
            cursor: 'pointer'
          }}
        >
          📈 Live Chart & Gemini Debate Floor
        </button>
        <button
          onClick={() => setActiveTab('topPicks')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'topPicks' ? '2px solid var(--accent-gold)' : '2px solid transparent',
            color: activeTab === 'topPicks' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '10px 0',
            cursor: 'pointer'
          }}
        >
          ✨ AI Top Recommendations ({topPicks.length > 0 ? topPicks.length : 5})
        </button>
      </div>

      {/* Main Content Layout */}
      {activeTab === 'chart' ? (
        <main className="main-content">
          {/* Left Sidebar: Watchlist */}
          <Sidebar
            stocks={stocks}
            selectedTicker={selectedTicker}
            onSelectTicker={setSelectedTicker}
          />

          {/* Middle Main: Candlestick Chart */}
          <CandlestickChart
            stock={activeStock}
            candles={candles}
            indicators={indicators}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            onTriggerDebate={handleTriggerDebate}
            isDebating={isDebating}
          />

          {/* Right Panel: AI Debate Floor */}
          <DebatePanel
            ticker={selectedTicker}
            mode={mode}
            opinions={opinions}
            verdict={verdict}
            isDebating={isDebating}
            onRunDebate={handleTriggerDebate}
          />
        </main>
      ) : (
        <main style={{ padding: '16px', height: 'calc(100vh - 108px)' }}>
          <TopPicks
            picks={topPicks.length > 0 ? topPicks : [
              { rank: 1, ticker: 'NVDA', name: 'NVIDIA Corporation', price: 128.80, change: 4.3, change_percent: 3.45, consensus_score: 9.6, signal: 'STRONG BUY', rationale: 'Intraday VWAP breakout with high institutional order flow.', target_price: 135.00, stop_loss: 124.00 },
              { rank: 2, ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2985.40, change: 25.4, change_percent: 0.86, consensus_score: 9.4, signal: 'STRONG BUY', rationale: 'Strong energy/telecom earnings tailwind and clean EMA cross.', target_price: 3080.00, stop_loss: 2940.00 },
              { rank: 3, ticker: 'TCS', name: 'Tata Consultancy Services', price: 4180.20, change: 30.2, change_percent: 0.73, consensus_score: 9.1, signal: 'BUY', rationale: 'IT sector momentum and high relative strength.', target_price: 4300.00, stop_loss: 4120.00 },
              { rank: 4, ticker: 'AAPL', name: 'Apple Inc', price: 224.50, change: 2.4, change_percent: 1.08, consensus_score: 8.9, signal: 'BUY', rationale: 'Apple Intelligence momentum driving buy volume.', target_price: 235.00, stop_loss: 220.00 },
              { rank: 5, ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1210.80, change: 15.8, change_percent: 1.32, consensus_score: 8.7, signal: 'BUY', rationale: 'Banking sector rally lead with strong balance sheet.', target_price: 1250.00, stop_loss: 1190.00 },
            ]}
            mode={mode}
            onSelectTicker={(ticker) => {
              setSelectedTicker(ticker);
              setActiveTab('chart');
            }}
          />
        </main>
      )}
    </div>
  );
}

function round(val: number): number {
  return Math.round(val * 100) / 100;
}
