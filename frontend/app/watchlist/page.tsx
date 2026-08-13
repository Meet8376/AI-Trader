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
import { Star, Trash2, TrendingUp, BarChart2, Plus, ShoppingBag } from 'lucide-react';

export default function WatchlistPage() {
  const watchlist = useTraderStore((state) => state.watchlist);
  const removeFromWatchlist = useTraderStore((state) => state.removeFromWatchlist);
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);
  const setSearchModalOpen = useTraderStore((state) => state.setSearchModalOpen);

  const [allStocks, setAllStocks] = useState<StockQuote[]>([]);
  const [activeTradeStock, setActiveTradeStock] = useState<StockQuote | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchStocks();
        if (res && res.length > 0) setAllStocks(res);
      } catch (e) {
        console.log('Using catalog fallback');
      }
    }
    loadData();
  }, []);

  const watchedStocks = watchlist.map((ticker) => {
    const found = allStocks.find((s) => s.ticker === ticker);
    if (found) return found;
    return {
      ticker,
      name: `${ticker} India Ltd`,
      price: 1500.0,
      change: 15.0,
      change_percent: 1.0,
      high: 1520.0,
      low: 1480.0,
      open: 1490.0,
      volume: 1200000,
      market_cap: '₹15,000 Cr',
      pe_ratio: 22.0,
      sector: 'NSE/BSE'
    } as StockQuote;
  });

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      <main className="main-layout" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star style={{ color: 'var(--accent-gold)' }} fill="var(--accent-gold)" size={24} /> My Watchlist ({watchlist.length} Stocks)
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              Real-time prices and quick trade triggers for your bookmarked Indian equities
            </p>
          </div>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Add Stock to Watchlist
          </button>
        </div>

        {/* Watchlist Table */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock / Company</th>
                <th>Sector</th>
                <th>Price (LTP)</th>
                <th>Change (%)</th>
                <th>Day Range</th>
                <th>Market Cap</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchedStocks.map((stock) => {
                const isUp = stock.change_percent >= 0;
                return (
                  <tr key={stock.ticker}>
                    <td>
                      <Link
                        href={`/chart/${stock.ticker}`}
                        onClick={() => setSelectedTicker(stock.ticker)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div style={{ fontWeight: 800, color: 'var(--text-bright)', fontSize: '0.95rem' }}>
                          {stock.ticker}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
                      </Link>
                    </td>
                    <td>
                      <span className="badge badge-purple">{stock.sector || 'NSE/BSE'}</span>
                    </td>
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                      ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`font-mono ${isUp ? 'text-green' : 'text-red'}`} style={{ fontWeight: 700 }}>
                      {isUp ? '▲ +' : '▼ '}{stock.change_percent.toFixed(2)}%
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      ₹{stock.low} - ₹{stock.high}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                      {stock.market_cap || '₹15,000 Cr'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link
                          href={`/chart/${stock.ticker}`}
                          onClick={() => setSelectedTicker(stock.ticker)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <BarChart2 size={14} /> Chart
                        </Link>
                        <button
                          onClick={() => {
                            setActiveTradeStock(stock);
                            setTradeModalOpen(true);
                          }}
                          className="btn btn-success"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <ShoppingBag size={14} /> Trade
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(stock.ticker)}
                          className="btn btn-ghost"
                          style={{ padding: '4px 6px', color: 'var(--accent-red-bright)' }}
                          title="Remove from Watchlist"
                        >
                          <Trash2 size={16} />
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
