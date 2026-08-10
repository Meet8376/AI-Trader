'use client';

import React, { useState } from 'react';
import { StockQuote } from '../types/stock';
import { Search, TrendingUp, TrendingDown, Eye, Filter } from 'lucide-react';

interface SidebarProps {
  stocks: StockQuote[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

const CATEGORIES = ['ALL', 'US TECH', 'INDIAN NSE', 'BANKING', 'AUTOMOTIVE'];

export const Sidebar: React.FC<SidebarProps> = ({ stocks, selectedTicker, onSelectTicker }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filtered = stocks.filter(s => {
    const matchesSearch = s.ticker.toLowerCase().includes(search.toLowerCase()) ||
                          s.name.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'ALL') return matchesSearch;
    if (activeCategory === 'US TECH') return matchesSearch && ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'NFLX'].includes(s.ticker);
    if (activeCategory === 'INDIAN NSE') return matchesSearch && ['RELIANCE', 'TCS', 'INFY', 'WIPRO', 'ADANIENT', 'BHARTIARTL', 'LTIM', 'ITC', 'LT', 'SUNPHARMA'].includes(s.ticker);
    if (activeCategory === 'BANKING') return matchesSearch && ['HDFCBANK', 'ICICIBANK', 'SBIN', 'JPM', 'BAJFINANCE'].includes(s.ticker);
    if (activeCategory === 'AUTOMOTIVE') return matchesSearch && ['TATAMOTORS', 'TSLA'].includes(s.ticker);
    return matchesSearch;
  });

  return (
    <aside className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color="var(--accent-blue)" /> Watchlist ({filtered.length}/{stocks.length})
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '10px 12px 6px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px'
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search NVDA, AAPL, RELIANCE..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>

        {/* Sector Category Filters */}
        <div style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          marginTop: '8px',
          paddingBottom: '4px'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'var(--accent-blue-bg)' : 'transparent',
                color: activeCategory === cat ? 'var(--accent-blue)' : 'var(--text-muted)',
                border: activeCategory === cat ? '1px solid var(--border-active)' : '1px solid transparent',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Tickers List */}
      <div className="card-body" style={{ padding: '6px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No stocks found matching "{search}"
          </div>
        ) : (
          filtered.map((stock) => {
            const isSelected = stock.ticker === selectedTicker;
            const isPositive = stock.change >= 0;

            return (
              <div
                key={stock.ticker}
                onClick={() => onSelectTicker(stock.ticker)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                    {stock.ticker}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stock.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {stock.ticker.match(/^(NVDA|AAPL|MSFT|GOOGL|AMZN|META|TSLA|AMD|NFLX|JPM)$/) ? '$' : '₹'}{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '2px'
                  }}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isPositive ? '+' : ''}{stock.change_percent}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
