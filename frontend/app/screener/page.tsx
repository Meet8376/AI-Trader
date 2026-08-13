'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { TickerTape } from '../../components/TickerTape';
import { SearchModal } from '../../components/SearchModal';
import { PaperTradeModal } from '../../components/PaperTradeModal';
import { useTraderStore } from '../../store/useTraderStore';
import { StockQuote } from '../../types/stock';
import { fetchStocks } from '../../lib/api';
import { Filter, Sliders, BarChart2, ShoppingBag, Check } from 'lucide-react';

const SECTORS = ['ALL', 'BANKING', 'IT SECTOR', 'AUTO & EV', 'ENERGY & INFRA', 'PHARMA & FMCG'];

export default function ScreenerPage() {
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);

  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [maxPe, setMaxPe] = useState<number>(100);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sortBy, setSortBy] = useState<'change' | 'pe' | 'price' | 'mcap'>('change');

  const [activeTradeStock, setActiveTradeStock] = useState<StockQuote | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchStocks();
        if (res && res.length > 0) setStocks(res);
      } catch (e) {
        console.log('Using default stock list');
      }
    }
    loadData();
  }, []);

  const filtered = stocks.filter((stock) => {
    if (selectedSector !== 'ALL' && stock.sector !== selectedSector) return false;
    if (stock.pe_ratio && stock.pe_ratio > maxPe) return false;
    if (stock.price < minPrice || stock.price > maxPrice) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'change') return b.change_percent - a.change_percent;
    if (sortBy === 'pe') return (a.pe_ratio || 999) - (b.pe_ratio || 999);
    if (sortBy === 'price') return b.price - a.price;
    return 0;
  });

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      <main className="main-layout" style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter style={{ color: 'var(--accent-purple)' }} size={26} /> Indian Stock Screener
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Filter 50+ Indian NSE & BSE stocks by valuation multiples, sector strength, and price range
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card" style={{ padding: '18px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            {/* Sector Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Sector Filter
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-bright)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Max P/E Slider */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Max P/E Ratio: <span className="font-mono text-purple">{maxPe}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={maxPe}
                onChange={(e) => setMaxPe(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Price Range Slider */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Price Range: <span className="font-mono text-blue">₹{minPrice} - ₹{maxPrice}</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                  style={{
                    width: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-bright)',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8rem'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value) || 20000)}
                  style={{
                    width: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-bright)',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Sort Results By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-bright)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              >
                <option value="change">% Change (Highest first)</option>
                <option value="pe">P/E Ratio (Lowest / Undervalued first)</option>
                <option value="price">LTP Price (Highest first)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Found <span style={{ fontWeight: 800, color: 'var(--text-bright)' }}>{sorted.length}</span> matching stocks
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Ticker / Name</th>
                <th>Sector</th>
                <th>LTP Price</th>
                <th>Change (%)</th>
                <th>P/E Ratio</th>
                <th>Market Cap</th>
                <th>Volume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((stock) => {
                const isUp = stock.change_percent >= 0;
                return (
                  <tr key={stock.ticker}>
                    <td>
                      <Link
                        href={`/chart/${stock.ticker}`}
                        onClick={() => setSelectedTicker(stock.ticker)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div style={{ fontWeight: 800, color: 'var(--text-bright)' }}>{stock.ticker}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-purple">{stock.sector || 'NSE/BSE'}</span>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 700 }}>
                      ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`font-mono ${isUp ? 'text-green' : 'text-red'}`} style={{ fontWeight: 700 }}>
                      {isUp ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent-purple)' }}>
                      {stock.pe_ratio || 'N/A'}
                    </td>
                    <td className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                      {stock.market_cap || '₹15,000 Cr'}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {(stock.volume / 100000).toFixed(2)} Lakh
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link
                          href={`/chart/${stock.ticker}`}
                          onClick={() => setSelectedTicker(stock.ticker)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Chart
                        </Link>
                        <button
                          onClick={() => {
                            setActiveTradeStock(stock);
                            setTradeModalOpen(true);
                          }}
                          className="btn btn-success"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

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
