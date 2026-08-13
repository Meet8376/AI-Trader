'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/Navbar';
import { TickerTape } from '../components/TickerTape';
import { SearchModal } from '../components/SearchModal';
import { PaperTradeModal } from '../components/PaperTradeModal';
import { useTraderStore } from '../store/useTraderStore';
import { StockQuote } from '../types/stock';
import { fetchStocks } from '../lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  BarChart2, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

const SECTORS = [
  { name: 'BANKING', change: 1.15, stocksCount: 12, topMover: 'ICICIBANK' },
  { name: 'IT SECTOR', change: -0.45, stocksCount: 8, topMover: 'TCS' },
  { name: 'AUTO & EV', change: 1.62, stocksCount: 6, topMover: 'TATAMOTORS' },
  { name: 'ENERGY & INFRA', change: 0.88, stocksCount: 14, topMover: 'RELIANCE' },
  { name: 'PHARMA & FMCG', change: 0.35, stocksCount: 10, topMover: 'ITC' },
  { name: 'METALS & MINING', change: 1.42, stocksCount: 5, topMover: 'TATASTEEL' }
];

export default function MarketOverviewHome() {
  const indices = useTraderStore((state) => state.indices);
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);
  
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [activeTradeStock, setActiveTradeStock] = useState<StockQuote | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchStocks();
        if (res && res.length > 0) setStocks(res);
      } catch (e) {
        console.log('Using default stock catalog');
      }
    }
    loadData();
  }, []);

  const gainers = [...stocks].sort((a, b) => b.change_percent - a.change_percent).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.change_percent - b.change_percent).slice(0, 5);
  const activeVolume = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 6);

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      <main className="main-layout" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {/* Hero Banner: Indian Markets Today */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', letterSpacing: '-0.5px' }}>
              Indian Equity Markets Today
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              Live NSE/BSE Index Movement, Sector Heatmap, Institutional Activity & Real-time Trading
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/screener" className="btn btn-secondary">
              🔍 Stock Screener
            </Link>
            <Link href="/portfolio" className="btn btn-primary">
              💼 Virtual Portfolio (₹10L Cash)
            </Link>
          </div>
        </div>

        {/* Major Indices Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {indices.map((idx) => {
            const isUp = idx.change >= 0;
            return (
              <div key={idx.symbol} className="glass-card glass-card-hover" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-bright)' }}>{idx.name}</span>
                  <span className={`badge ${isUp ? 'badge-green' : 'badge-red'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(idx.change_percent).toFixed(2)}%
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '4px' }}>
                  {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`font-mono ${isUp ? 'text-green' : 'text-red'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {isUp ? '+' : ''}{idx.change.toFixed(2)} pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Sector Performance Heatmap */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} style={{ color: 'var(--accent-purple)' }} /> Sector Heatmap (NSE/BSE)
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Color weighted by sector movement</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {SECTORS.map((sec) => {
              const isUp = sec.change >= 0;
              return (
                <div
                  key={sec.name}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    background: isUp ? 'rgba(8, 153, 129, 0.08)' : 'rgba(242, 54, 69, 0.08)',
                    borderColor: isUp ? 'rgba(8, 153, 129, 0.3)' : 'rgba(242, 54, 69, 0.3)'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '6px' }}>
                    {sec.name}
                  </div>
                  <div className={`font-mono ${isUp ? 'text-green' : 'text-red'}`} style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {isUp ? '+' : ''}{sec.change.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Leader: <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{sec.topMover}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side: Top Gainers & Top Losers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {/* Top Gainers */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-green-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={18} /> Top NSE Gainers
              </h3>
              <Link href="/screener" style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gainers.map((stock) => (
                <div
                  key={stock.ticker}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Link
                    href={`/chart/${stock.ticker}`}
                    onClick={() => setSelectedTicker(stock.ticker)}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-bright)' }}>{stock.ticker}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                        ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="font-mono text-green" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        +{stock.change_percent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTradeStock(stock);
                        setTradeModalOpen(true);
                      }}
                      className="btn btn-success"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      BUY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-red-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingDown size={18} /> Top NSE Losers
              </h3>
              <Link href="/screener" style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {losers.map((stock) => (
                <div
                  key={stock.ticker}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Link
                    href={`/chart/${stock.ticker}`}
                    onClick={() => setSelectedTicker(stock.ticker)}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-bright)' }}>{stock.ticker}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                        ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="font-mono text-red" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        {stock.change_percent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTradeStock(stock);
                        setTradeModalOpen(true);
                      }}
                      className="btn btn-danger"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FII / DII Institutional Activity Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FII NET ACTIVITY (TODAY)</div>
            <div className="font-mono text-green" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
              +₹1,420.50 Cr
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Foreign Institutional Buying</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DII NET ACTIVITY (TODAY)</div>
            <div className="font-mono text-green" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
              +₹890.20 Cr
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Domestic Institutional Buying</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INDIA VIX (VOLATILITY)</div>
            <div className="font-mono text-blue" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
              14.25 <span style={{ fontSize: '0.85rem', color: 'var(--accent-red-bright)' }}>(-2.1%)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Low Volatility Regime</div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SearchModal />
      {activeTradeStock && (
        <PaperTradeModal
          stock={activeTradeStock}
          isOpen={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
        />
      )}
    </div>
  );
}
