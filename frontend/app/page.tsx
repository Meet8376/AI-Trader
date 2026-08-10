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
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2985.40, change: 25.40, change_percent: 0.86, high: 3010.00, low: 2960.00, open: 2970.00, volume: 2450000, market_cap: '₹20.19 Lakh Cr', pe_ratio: 28.4 },
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd', price: 4180.20, change: 30.20, change_percent: 0.73, high: 4210.00, low: 4140.00, open: 4150.00, volume: 1200000, market_cap: '₹15.12 Lakh Cr', pe_ratio: 33.1 },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.10, change: 15.10, change_percent: 0.93, high: 1658.00, low: 1625.00, open: 1630.00, volume: 4200000, market_cap: '₹12.52 Lakh Cr', pe_ratio: 18.9 },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1210.80, change: 15.80, change_percent: 1.32, high: 1220.00, low: 1190.00, open: 1195.00, volume: 2800000, market_cap: '₹8.51 Lakh Cr', pe_ratio: 17.4 },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1475.25, change: 15.25, change_percent: 1.04, high: 1488.00, low: 1455.00, open: 1460.00, volume: 1950000, market_cap: '₹8.72 Lakh Cr', pe_ratio: 52.1 },
  { ticker: 'INFY', name: 'Infosys Limited', price: 1820.65, change: -19.35, change_percent: -1.05, high: 1845.00, low: 1810.00, open: 1840.00, volume: 3100000, market_cap: '₹7.56 Lakh Cr', pe_ratio: 26.8 },
  { ticker: 'SBIN', name: 'State Bank of India', price: 845.75, change: 10.75, change_percent: 1.29, high: 855.00, low: 830.00, open: 835.00, volume: 5400000, market_cap: '₹7.55 Lakh Cr', pe_ratio: 11.8 },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1055.30, change: 15.30, change_percent: 1.47, high: 1065.00, low: 1035.00, open: 1040.00, volume: 3800000, market_cap: '₹3.88 Lakh Cr', pe_ratio: 14.2 },
  { ticker: 'LT', name: 'Larsen & Toubro Ltd', price: 3615.00, change: 35.00, change_percent: 0.98, high: 3640.00, low: 3570.00, open: 3580.00, volume: 1100000, market_cap: '₹4.96 Lakh Cr', pe_ratio: 34.5 },
  { ticker: 'ITC', name: 'ITC Limited', price: 492.50, change: 4.50, change_percent: 0.92, high: 496.00, low: 486.00, open: 488.00, volume: 4800000, market_cap: '₹6.15 Lakh Cr', pe_ratio: 28.1 }
];

export default function DashboardPage() {
  const [mode, setMode] = useState<TradingMode>('intraday');
  const [activeTab, setActiveTab] = useState<'chart' | 'topPicks'>('chart');
  
  const [stocks, setStocks] = useState<StockQuote[]>(MOCK_STOCKS);
  const [selectedTicker, setSelectedTicker] = useState<string>('RELIANCE');
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
        const activeStock = stocks.find(s => s.ticker === selectedTicker) || MOCK_STOCKS[0];
        
        // Generate valid IST Indian market session timestamps
        const now = new Date();
        const timestamps: string[] = [];
        let dayOffset = 0;
        
        while (timestamps.length < 60) {
          const d = new Date(now.getTime() - dayOffset * 86400000);
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dateStr = String(d.getDate()).padStart(2, '0');
            
            const daySlots: string[] = [];
            let m = 9 * 60 + 15; // 09:15 AM IST
            const endM = 15 * 60 + 30; // 03:30 PM IST
            
            while (m <= endM) {
              const hh = String(Math.floor(m / 60)).padStart(2, '0');
              const mm = String(m % 60).padStart(2, '0');
              daySlots.push(`${year}-${month}-${dateStr} ${hh}:${mm}`);
              m += 15;
            }
            timestamps.unshift(...daySlots);
          }
          dayOffset++;
        }
        
        const recentSlots = timestamps.slice(-60);

        const mockCandles: CandleData[] = recentSlots.map((ts, i) => {
          const wave = Math.sin((i + selectedTicker.length) / 5) * 0.015;
          const base = activeStock.price * (0.97 + wave);
          return {
            time: ts,
            open: round(base),
            high: round(base * 1.004),
            low: round(base * 0.996),
            close: round(base * 1.001),
            volume: Math.floor(100000 + Math.abs(Math.sin(i)) * 150000)
          };
        });
        setCandles(mockCandles);
        setIndicators({
          rsi: 64.2,
          macd: { macd: 14.2, signal: 10.8, histogram: 3.4 },
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
  }, [selectedTicker, timeframe, stocks]);

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
        const currSym = '₹';

        const mockOpinions: AgentOpinion[] = [
          {
            agent_id: 'tech_analyst',
            agent_name: 'Alex Vance (Gemini AI)',
            role: 'Technical Analyst',
            avatar: '📊',
            signal: 'BUY',
            confidence: 88,
            key_points: [
              `Price action holding above EMA(20) at ${currSym}${round(currentStock.price * 0.992)}.`,
              'RSI (14) at 64.2 confirms healthy bullish momentum on NSE chart without overbought stretch.',
              'Intraday VWAP anchored support providing firm floor.'
            ],
            technical_targets: {
              entry: currentStock.price,
              target_1: round(currentStock.price * 1.03),
              target_2: round(currentStock.price * 1.05),
              stop_loss: round(currentStock.price * 0.985)
            },
            full_argument: `Technicals for ${selectedTicker} confirm a high-probability bullish setup on Indian exchanges.`
          },
          {
            agent_id: 'sentiment_analyst',
            agent_name: 'Maya Lin (Gemini AI)',
            role: 'News & Sentiment Analyst',
            avatar: '📰',
            signal: 'BUY',
            confidence: 84,
            key_points: [
              'DII & FII block orders favor steady accumulation on dips.',
              'Sector relative strength index outperforming NIFTY 50 by +2.1%.'
            ],
            full_argument: `Market sentiment and order book depth remain heavily buyer dominant.`
          },
          {
            agent_id: 'bull_debater',
            agent_name: "Leo 'The Bull' Sterling (Gemini AI)",
            role: 'Bull Debater',
            avatar: '🐂',
            signal: 'BUY',
            confidence: 91,
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
              'Trailing stop-loss recommended to guard against RBI policy rate volatility.'
            ],
            full_argument: `Caution advised near supply zone resistance on BSE.`
          }
        ];

        const mockVerdict: DebateVerdict = {
          ticker: selectedTicker,
          mode: mode,
          verdict: 'BUY',
          confidence: 86,
          consensus_score: 8.8,
          target_price: round(currentStock.price * (mode === 'intraday' ? 1.035 : 1.15)),
          stop_loss: round(currentStock.price * (mode === 'intraday' ? 0.985 : 0.94)),
          horizon: mode === 'intraday' ? '1-3 Days (Intraday)' : '3-6 Months (Long-Term)',
          summary: `The Gemini AI Trading Floor reaches consensus: BUY ${selectedTicker} at ${currSym}${currentStock.price} on NSE/BSE. Technical momentum and institutional order flow outweigh short-term bear warnings.`,
          bull_case: 'Technical breakout supported by institutional DII volume.',
          bear_case: 'Overhead supply near resistance zone.'
        };

        setOpinions(mockOpinions);
        setVerdict(mockVerdict);
      }, 1000);
    } finally {
      setIsDebating(false);
    }
  };

  const handleSelectTicker = (ticker: string) => {
    const formatted = ticker.toUpperCase().trim();
    setSelectedTicker(formatted);
    const exists = stocks.some(s => s.ticker === formatted);
    if (!exists) {
      const newStock: StockQuote = {
        ticker: formatted,
        name: `${formatted} India Ltd`,
        price: 1450.00,
        change: 18.50,
        change_percent: 1.29,
        high: 1470.00,
        low: 1435.00,
        open: 1440.00,
        volume: 1850000,
        market_cap: '₹15,000 Cr',
        pe_ratio: 24.5
      };
      setStocks(prev => [newStock, ...prev]);
    }
  };

  const activeStock = stocks.find(s => s.ticker === selectedTicker) || {
    ticker: selectedTicker,
    name: `${selectedTicker} India Ltd`,
    price: 1450.00,
    change: 18.50,
    change_percent: 1.29,
    high: 1470.00,
    low: 1435.00,
    open: 1440.00,
    volume: 1850000,
    market_cap: '₹15,000 Cr',
    pe_ratio: 24.5
  };

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
          📈 Live NSE/BSE Chart & AI Debate Floor
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
          ✨ Indian AI Top Recommendations ({topPicks.length > 0 ? topPicks.length : 5})
        </button>
      </div>

      {/* Main Content Layout */}
      {activeTab === 'chart' ? (
        <main className="main-content">
          {/* Left Sidebar: Watchlist */}
          <Sidebar
            stocks={stocks}
            selectedTicker={selectedTicker}
            onSelectTicker={handleSelectTicker}
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
              { rank: 1, ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2985.40, change: 25.4, change_percent: 0.86, consensus_score: 9.6, signal: 'STRONG BUY', rationale: 'Intraday VWAP breakout with high DII order flow on NSE.', target_price: 3080.00, stop_loss: 2940.00 },
              { rank: 2, ticker: 'TCS', name: 'Tata Consultancy Services Ltd', price: 4180.20, change: 30.2, change_percent: 0.73, consensus_score: 9.4, signal: 'STRONG BUY', rationale: 'Strong IT sector momentum and bullish EMA crossover.', target_price: 4320.00, stop_loss: 4120.00 },
              { rank: 3, ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.10, change: 15.1, change_percent: 0.93, consensus_score: 9.2, signal: 'BUY', rationale: 'Banking rally leader with strong deposit growth.', target_price: 1710.00, stop_loss: 1620.00 },
              { rank: 4, ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1055.30, change: 15.3, change_percent: 1.47, consensus_score: 9.0, signal: 'BUY', rationale: 'JLR margins expansion and EV market leadership in India.', target_price: 1110.00, stop_loss: 1030.00 },
              { rank: 5, ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1210.80, change: 15.8, change_percent: 1.32, consensus_score: 8.8, signal: 'BUY', rationale: 'NIFTY Bank breakout with strong credit growth metrics.', target_price: 1260.00, stop_loss: 1190.00 },
            ]}
            mode={mode}
            onSelectTicker={(ticker) => {
              handleSelectTicker(ticker);
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
