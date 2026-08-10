'use client';

import React, { useState } from 'react';
import { StockQuote } from '../types/stock';
import { Search, TrendingUp, TrendingDown, Eye, PlusCircle } from 'lucide-react';

interface SidebarProps {
  stocks: StockQuote[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

const CATEGORIES = ['ALL', 'NIFTY 50', 'BANKING', 'IT SECTOR', 'AUTO & EV', 'ENERGY & INFRA', 'PHARMA & FMCG'];

export const Sidebar: React.FC<SidebarProps> = ({ stocks, selectedTicker, onSelectTicker }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const cleanSearch = search.trim().toUpperCase();

  const filtered = stocks.filter(s => {
    const matchesSearch = s.ticker.toLowerCase().includes(search.toLowerCase()) ||
                          s.name.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'ALL') return matchesSearch;
    if (activeCategory === 'NIFTY 50') return matchesSearch && ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL', 'INFY', 'SBIN', 'ITC', 'HINDUNILVR', 'LT'].includes(s.ticker);
    if (activeCategory === 'BANKING') return matchesSearch && ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'BAJFINANCE', 'BAJAJFINSV', 'INDUSINDBK', 'BANKBARODA', 'PNB'].includes(s.ticker);
    if (activeCategory === 'IT SECTOR') return matchesSearch && ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'LTIM', 'TECHM', 'PERSISTENT', 'ZOMATO'].includes(s.ticker);
    if (activeCategory === 'AUTO & EV') return matchesSearch && ['TATAMOTORS', 'M&M', 'MARUTI', 'BAJAJ-AUTO', 'HEROMOTOCO', 'EICHERMOT'].includes(s.ticker);
    if (activeCategory === 'ENERGY & INFRA') return matchesSearch && ['RELIANCE', 'NTPC', 'POWERGRID', 'ONGC', 'BPCL', 'IOC', 'TATAPOWER', 'ADANIGREEN', 'ADANIENT', 'ADANIPORTS', 'LT', 'TATASTEEL', 'HINDALCO', 'JSWSTEEL', 'ULTRACEMCO', 'GRASIM'].includes(s.ticker);
    if (activeCategory === 'PHARMA & FMCG') return matchesSearch && ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'APOLLOHOSP', 'ITC', 'HINDUNILVR', 'TITAN', 'ASIANPAINT', 'NESTLEIND', 'BRITANNIA', 'TATACONSUM', 'DMART'].includes(s.ticker);
    return matchesSearch;
  });

  const exactMatch = stocks.some(s => s.ticker.toUpperCase() === cleanSearch);

  const handleAddCustomStock = () => {
    if (cleanSearch) {
      onSelectTicker(cleanSearch);
      setSearch('');
    }
  };

  return (
    <aside className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color="var(--accent-blue)" /> Indian Stock Watchlist ({stocks.length}+ NSE/BSE)
        </div>
        <span style={{ fontSize: '0.68rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
          LIVE NSE / BSE
        </span>
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
            placeholder="Search ANY stock (e.g. SUZLON, ZOMATO, PAYTM)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && cleanSearch && !exactMatch) {
                handleAddCustomStock();
              }
            }}
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
      <div className="card-body" style={{ padding: '6px', overflowY: 'auto', flex: 1 }}>
        {/* TradingView / Groww style: Dynamic search button if custom ticker typed */}
        {cleanSearch && !exactMatch && (
          <div
            onClick={handleAddCustomStock}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '8px',
              cursor: 'pointer',
              background: 'var(--accent-blue-bg)',
              border: '1px dashed var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--accent-blue)',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={15} />
              <span>Load "{cleanSearch}" on Chart</span>
            </div>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>NSE / BSE</span>
          </div>
        )}

        {filtered.length === 0 && !cleanSearch ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No Indian stocks found. Type any stock symbol above!
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
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {stock.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

