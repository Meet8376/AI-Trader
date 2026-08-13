'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTraderStore } from '../store/useTraderStore';
import { StockQuote } from '../types/stock';

const DEFAULT_POPULAR_STOCKS = [
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2985.40, change_percent: 0.86, sector: 'ENERGY & INFRA' },
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd', price: 4180.20, change_percent: 0.73, sector: 'IT SECTOR' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1645.10, change_percent: 0.93, sector: 'BANKING' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1210.80, change_percent: 1.32, sector: 'BANKING' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1475.25, change_percent: 1.04, sector: 'ENERGY & INFRA' },
  { ticker: 'INFY', name: 'Infosys Limited', price: 1820.65, change_percent: -1.05, sector: 'IT SECTOR' },
  { ticker: 'SBIN', name: 'State Bank of India', price: 845.75, change_percent: 1.29, sector: 'BANKING' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1055.30, change_percent: 1.47, sector: 'AUTO & EV' },
  { ticker: 'LT', name: 'Larsen & Toubro Ltd', price: 3615.00, change_percent: 0.98, sector: 'ENERGY & INFRA' },
  { ticker: 'ITC', name: 'ITC Limited', price: 492.50, change_percent: 0.92, sector: 'PHARMA & FMCG' },
  { ticker: 'ZOMATO', name: 'Zomato Limited', price: 265.40, change_percent: 2.15, sector: 'IT SECTOR' },
  { ticker: 'TATAPOWER', name: 'Tata Power Co Ltd', price: 438.50, change_percent: 1.85, sector: 'ENERGY & INFRA' }
];

export const SearchModal: React.FC = () => {
  const router = useRouter();
  const isOpen = useTraderStore((state) => state.searchModalOpen);
  const setSearchModalOpen = useTraderStore((state) => state.setSearchModalOpen);
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);
  const stocks = useTraderStore((state) => state.stocks);

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setSearchModalOpen]);

  if (!isOpen) return null;

  const stockList = stocks.length > 0 ? stocks : DEFAULT_POPULAR_STOCKS;

  const filtered = stockList.filter(
    (s) =>
      s.ticker.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.sector && s.sector.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setSearchModalOpen(false);
    router.push(`/chart/${ticker}`);
  };

  return (
    <div className="modal-overlay" onClick={() => setSearchModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Search size={20} style={{ color: 'var(--text-secondary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search NSE/BSE stocks by ticker, name or sector... (e.g. RELIANCE, TCS, Banking)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-bright)',
              fontSize: '0.95rem'
            }}
          />
          <button
            onClick={() => setSearchModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Results / Quick Suggestions */}
        <div style={{ padding: '12px 16px', overflowY: 'auto', maxHeight: '420px' }}>
          {query.trim() === '' && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🔥 Trending NSE/BSE Bluechips
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No NSE/BSE stock found matching "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filtered.map((stock) => {
                const isUp = stock.change_percent >= 0;
                return (
                  <div
                    key={stock.ticker}
                    onClick={() => handleSelect(stock.ticker)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      background: 'var(--bg-tertiary)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.9rem' }}>
                          {stock.ticker}
                        </span>
                        <span className="badge badge-blue">NSE/BSE</span>
                        {stock.sector && <span className="badge badge-purple">{stock.sector}</span>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {stock.name}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.9rem' }}>
                        ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`font-mono ${isUp ? 'text-green' : 'text-red'}`} style={{ fontSize: '0.78rem', fontWeight: 500 }}>
                        {isUp ? '+' : ''}{stock.change_percent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Keyboard Hint */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>Press <kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-primary)' }}>ESC</kbd> to close</span>
          <span>Tip: Use <kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-primary)' }}>Ctrl+K</kbd> anywhere to search</span>
        </div>
      </div>
    </div>
  );
};
