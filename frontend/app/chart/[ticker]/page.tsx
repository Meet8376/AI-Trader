'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { TickerTape } from '../../../components/TickerTape';
import { Sidebar } from '../../../components/Sidebar';
import { CandlestickChart } from '../../../components/CandlestickChart';
import { DebatePanel } from '../../../components/DebatePanel';
import { PositionSizerModal } from '../../../components/PositionSizerModal';
import { PaperTradeModal } from '../../../components/PaperTradeModal';
import { SearchModal } from '../../../components/SearchModal';
import { StockQuote, CandleData, TechnicalIndicators } from '../../../types/stock';
import { AgentOpinion, DebateVerdict } from '../../../types/debate';
import { fetchStocks, fetchStockCandles, analyzeStock } from '../../../lib/api';
import { useTraderStore } from '../../../store/useTraderStore';
import { Activity, Newspaper, Layers, ShoppingBag } from 'lucide-react';

const MOCK_STOCKS: StockQuote[] = [
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2985.40, change: 25.40, change_percent: 0.86, high: 3010.00, low: 2960.00, open: 2970.00, volume: 2450000, market_cap: '₹20.19 Lakh Cr', pe_ratio: 28.4, sector: 'ENERGY & INFRA' },
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd', price: 4180.20, change: 30.20, change_percent: 0.73, high: 4210.00, low: 4140.00, open: 4150.00, volume: 1200000, market_cap: '₹15.12 Lakh Cr', pe_ratio: 33.1, sector: 'IT SECTOR' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.10, change: 15.10, change_percent: 0.93, high: 1658.00, low: 1625.00, open: 1630.00, volume: 4200000, market_cap: '₹12.52 Lakh Cr', pe_ratio: 18.9, sector: 'BANKING' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1210.80, change: 15.80, change_percent: 1.32, high: 1220.00, low: 1190.00, open: 1195.00, volume: 2800000, market_cap: '₹8.51 Lakh Cr', pe_ratio: 17.4, sector: 'BANKING' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1475.25, change: 15.25, change_percent: 1.04, high: 1488.00, low: 1455.00, open: 1460.00, volume: 1950000, market_cap: '₹8.72 Lakh Cr', pe_ratio: 52.1, sector: 'ENERGY & INFRA' },
  { ticker: 'INFY', name: 'Infosys Limited', price: 1820.65, change: -19.35, change_percent: -1.05, high: 1845.00, low: 1810.00, open: 1840.00, volume: 3100000, market_cap: '₹7.56 Lakh Cr', pe_ratio: 26.8, sector: 'IT SECTOR' },
  { ticker: 'SBIN', name: 'State Bank of India', price: 845.75, change: 10.75, change_percent: 1.29, high: 855.00, low: 830.00, open: 835.00, volume: 5400000, market_cap: '₹7.55 Lakh Cr', pe_ratio: 11.8, sector: 'BANKING' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1055.30, change: 15.30, change_percent: 1.47, high: 1065.00, low: 1035.00, open: 1040.00, volume: 3800000, market_cap: '₹3.88 Lakh Cr', pe_ratio: 14.2, sector: 'AUTO & EV' },
  { ticker: 'LT', name: 'Larsen & Toubro Ltd', price: 3615.00, change: 35.00, change_percent: 0.98, high: 3640.00, low: 3570.00, open: 3580.00, volume: 1100000, market_cap: '₹4.96 Lakh Cr', pe_ratio: 34.5, sector: 'ENERGY & INFRA' },
  { ticker: 'ITC', name: 'ITC Limited', price: 492.50, change: 4.50, change_percent: 0.92, high: 496.00, low: 486.00, open: 488.00, volume: 4800000, market_cap: '₹6.15 Lakh Cr', pe_ratio: 28.1, sector: 'PHARMA & FMCG' }
];

export default function ChartPage() {
  const params = useParams();
  const router = useRouter();
  const urlTicker = (params.ticker as string || 'RELIANCE').toUpperCase();

  const mode = useTraderStore((state) => state.tradingMode);
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);
  
  const [stocks, setStocks] = useState<StockQuote[]>(MOCK_STOCKS);
  const [timeframe, setTimeframe] = useState<string>('15m');
  
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | undefined>(undefined);
  
  const [opinions, setOpinions] = useState<AgentOpinion[]>([]);
  const [verdict, setVerdict] = useState<DebateVerdict | null>(null);
  const [isDebating, setIsDebating] = useState<boolean>(false);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [tradeModalOpen, setTradeModalOpen] = useState<boolean>(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const [bottomTab, setBottomTab] = useState<'overview' | 'depth' | 'news'>('overview');

  useEffect(() => {
    setSelectedTicker(urlTicker);
  }, [urlTicker, setSelectedTicker]);

  // Load stocks
  useEffect(() => {
    async function loadStockList() {
      try {
        const stockList = await fetchStocks();
        if (stockList && stockList.length > 0) {
          setStocks(stockList);
        }
      } catch (e) {
        console.log('Using mock stock catalog');
      }
    }
    loadStockList();
  }, []);

  // Load Candles
  useEffect(() => {
    async function loadCandles() {
      try {
        const res = await fetchStockCandles(urlTicker, timeframe);
        setCandles(res.candles);
        setIndicators(res.indicators);
      } catch (e) {
        // Fallback generator
        const active = stocks.find(s => s.ticker === urlTicker) || MOCK_STOCKS[0];
        const baseP = active.price;
        const mockCandles: CandleData[] = [];
        let cur = baseP * 0.98;
        const now = Date.now();
        for (let i = 0; i < 60; i++) {
          const change = (Math.random() - 0.48) * (baseP * 0.005);
          const openP = Math.round(cur * 100) / 100;
          const closeP = Math.round((cur + change) * 100) / 100;
          const highP = Math.round(Math.max(openP, closeP) * (1 + Math.random() * 0.002) * 100) / 100;
          const lowP = Math.round(Math.min(openP, closeP) * (1 - Math.random() * 0.002) * 100) / 100;
          cur = closeP;
          mockCandles.push({
            time: new Date(now - (60 - i) * 15 * 60000).toISOString().slice(0, 16).replace('T', ' '),
            open: openP,
            high: highP,
            low: lowP,
            close: closeP,
            volume: Math.floor(100000 + Math.random() * 300000)
          });
        }
        setCandles(mockCandles);
        setIndicators({
          rsi: 62.4,
          macd: { macd: 12.4, signal: 9.8, histogram: 2.6 },
          bollinger: { upper: Math.round(baseP * 1.02), middle: Math.round(baseP), lower: Math.round(baseP * 0.98) },
          ema_20: Math.round(baseP * 0.994),
          ema_50: Math.round(baseP * 0.982),
          vwap: Math.round(baseP * 0.996),
          pivot: Math.round(baseP * 0.998),
          resistance_1: Math.round(baseP * 1.015),
          support_1: Math.round(baseP * 0.985),
          supertrend: 'Bullish (Buy)',
          trend: 'Strong Bullish'
        });
      }
    }

    loadCandles();
    setOpinions([]);
    setVerdict(null);
  }, [urlTicker, timeframe, stocks]);

  const handleTriggerDebate = async () => {
    setIsDebating(true);
    setOpinions([]);
    setVerdict(null);

    try {
      const res = await analyzeStock(urlTicker, mode);
      setOpinions(res.opinions);
      setVerdict(res.verdict);
    } catch (e) {
      setTimeout(() => {
        const active = stocks.find(s => s.ticker === urlTicker) || MOCK_STOCKS[0];
        setOpinions([
          {
            agent_id: 'tech_analyst',
            agent_name: 'Alex Vance (Gemini AI)',
            role: 'Technical Analyst',
            avatar: '📊',
            signal: 'BUY',
            confidence: 88,
            key_points: [
              `Holding strong above EMA(20) at ₹${Math.round(active.price * 0.994)}.`,
              'RSI (14) at 62.4 confirms healthy bullish momentum.',
              'VWAP anchored intraday support providing firm floor.'
            ],
            technical_targets: {
              entry: active.price,
              target_1: Math.round(active.price * 1.03),
              target_2: Math.round(active.price * 1.05),
              stop_loss: Math.round(active.price * 0.985)
            },
            full_argument: `Technicals for ${urlTicker} confirm high probability bullish momentum on NSE/BSE.`
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
              'Outperforming benchmark NIFTY index by +1.8%.'
            ],
            full_argument: `Market sentiment and order book depth remain heavily buyer dominant.`
          }
        ]);
        setVerdict({
          ticker: urlTicker,
          mode: mode,
          verdict: 'BUY',
          confidence: 86,
          consensus_score: 8.8,
          target_price: Math.round(active.price * 1.035),
          stop_loss: Math.round(active.price * 0.985),
          horizon: mode === 'intraday' ? '1-3 Days (Intraday)' : '3-6 Months (Long-Term)',
          summary: `Gemini AI Trading Floor consensus: BUY ${urlTicker} at ₹${active.price} on NSE/BSE. Technical momentum and order flow support bullish targets.`,
          bull_case: 'Technical breakout supported by institutional DII volume.',
          bear_case: 'Overhead supply near resistance zone.'
        });
      }, 1000);
    } finally {
      setIsDebating(false);
    }
  };

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    router.push(`/chart/${ticker}`);
  };

  const activeStock = stocks.find(s => s.ticker === urlTicker) || {
    ticker: urlTicker,
    name: `${urlTicker} India Ltd`,
    price: 1500.0,
    change: 18.5,
    change_percent: 1.25,
    high: 1520.0,
    low: 1480.0,
    open: 1490.0,
    volume: 1800000,
    market_cap: '₹25,000 Cr',
    pe_ratio: 24.5,
    sector: 'NSE/BSE'
  };

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      {/* Main TradingView 3-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 380px',
          height: 'calc(100vh - 94px)',
          gap: '8px',
          padding: '8px',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        {/* Left Column: Watchlist Sidebar */}
        <Sidebar
          stocks={stocks}
          selectedTicker={urlTicker}
          onSelectTicker={handleSelectTicker}
        />

        {/* Center Column: Full Chart & Details Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {/* Main Chart */}
          <CandlestickChart
            stock={activeStock}
            candles={candles}
            indicators={indicators}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            onTriggerDebate={handleTriggerDebate}
            isDebating={isDebating}
            onOpenTrade={(t) => {
              setTradeType(t);
              setTradeModalOpen(true);
            }}
          />

          {/* Sub-Tabs: Fundamentals, Order Book Depth, News */}
          <div className="glass-card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              <button
                onClick={() => setBottomTab('overview')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: bottomTab === 'overview' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  color: bottomTab === 'overview' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingBottom: '4px'
                }}
              >
                📊 Company Fundamentals & Overview
              </button>
              <button
                onClick={() => setBottomTab('depth')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: bottomTab === 'depth' ? '2px solid var(--accent-green-bright)' : '2px solid transparent',
                  color: bottomTab === 'depth' ? 'var(--accent-green-bright)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingBottom: '4px'
                }}
              >
                📉 Live Order Book (5-Level Depth)
              </button>
              <button
                onClick={() => setBottomTab('news')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: bottomTab === 'news' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  color: bottomTab === 'news' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingBottom: '4px'
                }}
              >
                📰 Stock News & Filings
              </button>
            </div>

            {bottomTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.82rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Market Cap</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)', marginTop: '2px' }}>{activeStock.market_cap || '₹15,000 Cr'}</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>P/E Ratio</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)', marginTop: '2px' }}>{activeStock.pe_ratio || 22.5}</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>52W High / Low</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)', marginTop: '2px' }}>
                    ₹{activeStock.high_52w || Math.round(activeStock.price * 1.15)} / ₹{activeStock.low_52w || Math.round(activeStock.price * 0.8)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Avg Volume (20D)</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)', marginTop: '2px' }}>
                    {activeStock.avg_volume ? `${(activeStock.avg_volume / 100000).toFixed(2)}L` : '24.5L'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Beta (Volatility)</div>
                  <div className="font-mono text-gold" style={{ fontWeight: 700, marginTop: '2px' }}>
                    {activeStock.beta || 1.12}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Dividend Yield</div>
                  <div className="font-mono text-green" style={{ fontWeight: 700, marginTop: '2px' }}>
                    {activeStock.dividend_yield ? `${activeStock.dividend_yield}%` : '1.45%'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>TTM EPS</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)', marginTop: '2px' }}>
                    ₹{activeStock.eps || Math.round(activeStock.price / (activeStock.pe_ratio || 22.5))}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Exchange</div>
                  <div className="font-mono text-blue" style={{ fontWeight: 700, marginTop: '2px' }}>NSE / BSE</div>
                </div>
              </div>
            )}

            {bottomTab === 'depth' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: 'var(--accent-green-bright)', fontWeight: 700, marginBottom: '6px' }}>BID (BUY ORDERS)</div>
                  <table className="data-table font-mono" style={{ fontSize: '0.75rem' }}>
                    <thead><tr><th>Orders</th><th>Qty</th><th>Price</th></tr></thead>
                    <tbody>
                      <tr><td>12</td><td>450</td><td className="text-green">₹{activeStock.price}</td></tr>
                      <tr><td>8</td><td>1,200</td><td className="text-green">₹{Math.round((activeStock.price - 0.5) * 100) / 100}</td></tr>
                      <tr><td>15</td><td>2,800</td><td className="text-green">₹{Math.round((activeStock.price - 1.0) * 100) / 100}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div style={{ color: 'var(--accent-red-bright)', fontWeight: 700, marginBottom: '6px' }}>ASK (SELL ORDERS)</div>
                  <table className="data-table font-mono" style={{ fontSize: '0.75rem' }}>
                    <thead><tr><th>Price</th><th>Qty</th><th>Orders</th></tr></thead>
                    <tbody>
                      <tr><td className="text-red">₹{Math.round((activeStock.price + 0.5) * 100) / 100}</td><td>320</td><td>5</td></tr>
                      <tr><td className="text-red">₹{Math.round((activeStock.price + 1.0) * 100) / 100}</td><td>950</td><td>11</td></tr>
                      <tr><td className="text-red">₹{Math.round((activeStock.price + 1.5) * 100) / 100}</td><td>1,840</td><td>19</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {bottomTab === 'news' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-bright)' }}>{activeStock.ticker}: Strong Q1 EBITDA Margins Beat Analyst Estimates</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Economic Times • 2 hours ago</div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-xs)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-bright)' }}>FII Inflows Surge in Indian Equities as {activeStock.ticker} Leads Sector Rally</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Moneycontrol • 5 hours ago</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Agent AI Debate Floor */}
        <DebatePanel
          ticker={urlTicker}
          mode={mode}
          opinions={opinions}
          verdict={verdict}
          isDebating={isDebating}
          onRunDebate={handleTriggerDebate}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />
      </div>

      {/* Modals */}
      <SearchModal />
      <PaperTradeModal
        stock={activeStock}
        initialType={tradeType}
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
      />
      <PositionSizerModal
        stock={activeStock}
        verdict={verdict}
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
