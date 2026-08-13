'use client';

import React from 'react';
import { Navbar } from '../../components/Navbar';
import { TickerTape } from '../../components/TickerTape';
import { SearchModal } from '../../components/SearchModal';
import { useTraderStore } from '../../store/useTraderStore';
import { TrendingUp, Activity, Globe, PieChart, ShieldCheck, Zap } from 'lucide-react';

export default function MarketPage() {
  const indices = useTraderStore((state) => state.indices);

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      <main className="main-layout" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe style={{ color: 'var(--accent-blue)' }} size={26} /> Indian Market Indices & Breadth
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Comprehensive overview of NSE benchmark indices, advance-decline ratios, and institutional flows
          </p>
        </div>

        {/* Indices Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {indices.map((idx) => {
            const isUp = idx.change >= 0;
            return (
              <div key={idx.symbol} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-bright)' }}>{idx.name}</span>
                  <span className={`badge ${isUp ? 'badge-green' : 'badge-red'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(idx.change_percent).toFixed(2)}%
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '6px' }}>
                  {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Day Range: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{idx.low} - {idx.high}</span></span>
                  <span className={`font-mono ${isUp ? 'text-green' : 'text-red'}`}>{isUp ? '+' : ''}{idx.change.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Market Breadth Bar */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>
            Market Breadth (Advances vs Declines)
          </h2>
          <div style={{ height: '14px', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex', marginBottom: '12px' }}>
            <div style={{ width: '68%', background: 'var(--accent-green-bright)' }} title="Advances: 1,420 (68%)" />
            <div style={{ width: '28%', background: 'var(--accent-red-bright)' }} title="Declines: 580 (28%)" />
            <div style={{ width: '4%', background: 'var(--text-muted)' }} title="Unchanged: 80 (4%)" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-green-bright)', fontWeight: 700 }}>Advances: 1,420 (68%)</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Unchanged: 80 (4%)</span>
            <span style={{ color: 'var(--accent-red-bright)', fontWeight: 700 }}>Declines: 580 (28%)</span>
          </div>
        </div>

        {/* Institutional Flow Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              Foreign Institutional Investors (FII)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Net Monthly Equity Investment on NSE/BSE</p>
            <div className="font-mono text-green" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              +₹14,580.40 Cr
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-green-bright)', marginTop: '6px' }}>Strong Accumulation Trend</div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px' }}>
              Domestic Institutional Investors (DII)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Mutual Funds & Insurance Net Inflows</p>
            <div className="font-mono text-green" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              +₹22,140.80 Cr
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-green-bright)', marginTop: '6px' }}>Record Monthly SIP Inflows</div>
          </div>
        </div>
      </main>

      <SearchModal />
    </div>
  );
}
