'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { TickerTape } from '../../components/TickerTape';
import { SearchModal } from '../../components/SearchModal';
import { Newspaper, ExternalLink, Filter } from 'lucide-react';
import { NewsArticle } from '../../types/stock';

const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'RBI Monetary Policy: Repo Rate Kept Unchanged at 6.5%, Maintains Balanced Growth Outlook',
    source: 'Economic Times',
    time: '30 mins ago',
    url: '#',
    summary: 'The Reserve Bank of India Governor announced a pause on interest rate hikes, citing steady CPI inflation cooling towards 4.2% target.',
    category: 'MACRO',
    tickers: ['HDFCBANK', 'ICICIBANK', 'SBIN']
  },
  {
    id: 'n2',
    title: 'Reliance Industries Q1 Consolidated Net Profit Rises 12.5% YoY to ₹19,800 Crore',
    source: 'Moneycontrol',
    time: '2 hours ago',
    url: '#',
    summary: 'Strong performance in Jio Telecom ARPU expansion and retail segment revenue offset lower refining margins in O2C business.',
    category: 'RESULTS',
    tickers: ['RELIANCE']
  },
  {
    id: 'n3',
    title: 'Tata Motors EVs Cross 1.5 Lakh Milestone in Domestic Sales as Nexon EV Dominates',
    source: 'LiveMint',
    time: '4 hours ago',
    url: '#',
    summary: 'Tata Motors passenger electric vehicle lineup continues market dominance with over 72% market share in Indian EV space.',
    category: 'NSE',
    tickers: ['TATAMOTORS']
  },
  {
    id: 'n4',
    title: 'TCS Signs $1.2 Billion Multi-Year Cloud Transformation Deal with European Banking Giant',
    source: 'Business Standard',
    time: '6 hours ago',
    url: '#',
    summary: 'Tata Consultancy Services secures key digital modernization project, boosting order book total contract value for FY25.',
    category: 'NSE',
    tickers: ['TCS', 'INFY']
  },
  {
    id: 'n5',
    title: 'SEBI Introduces New Same-Day Settlement (T+0) Framework for Top 500 Listed Stocks',
    source: 'CNBC-TV18',
    time: '8 hours ago',
    url: '#',
    summary: 'Capital markets regulator SEBI accelerates settlement timelines to enhance liquidity and lower systemic risk for retail investors.',
    category: 'ALL',
    tickers: ['NSE', 'BSE']
  }
];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filtered = activeCategory === 'ALL'
    ? MOCK_NEWS
    : MOCK_NEWS.filter((n) => n.category === activeCategory);

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      <main className="main-layout" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Newspaper style={{ color: 'var(--accent-gold)' }} size={26} /> Indian Financial & Stock Market News
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Real-time corporate earnings, RBI policy updates, SEBI circulars, and stock headlines
          </p>
        </div>

        {/* Filter Categories */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['ALL', 'NSE', 'RESULTS', 'MACRO'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeCategory === cat ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News Feed Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((news) => (
            <div key={news.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-gold">{news.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{news.source} • {news.time}</span>
                </div>
                {news.tickers && news.tickers.map((t) => (
                  <span key={t} className="badge badge-purple">{t}</span>
                ))}
              </div>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '8px', lineHeight: 1.4 }}>
                {news.title}
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                {news.summary}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--accent-blue)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Read full coverage <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SearchModal />
    </div>
  );
}
