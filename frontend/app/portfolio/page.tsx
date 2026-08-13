'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { TickerTape } from '../../components/TickerTape';
import { SearchModal } from '../../components/SearchModal';
import { PaperTradeModal } from '../../components/PaperTradeModal';
import { useTraderStore } from '../../store/useTraderStore';
import { Briefcase, TrendingUp, TrendingDown, RefreshCw, ShoppingBag, History, DollarSign } from 'lucide-react';
import { StockQuote } from '../../types/stock';

export default function PortfolioPage() {
  const cashBalance = useTraderStore((state) => state.cashBalance);
  const positions = useTraderStore((state) => state.positions);
  const tradeHistory = useTraderStore((state) => state.tradeHistory);
  const resetPortfolio = useTraderStore((state) => state.resetPortfolio);
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);

  const [activeTradeStock, setActiveTradeStock] = useState<StockQuote | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('SELL');

  const totalInvested = positions.reduce((acc, p) => acc + p.totalCost, 0);
  const currentValue = positions.reduce((acc, p) => acc + p.currentValue, 0);
  const totalPnL = currentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const totalNetWorth = cashBalance + currentValue;

  const handleSellPosition = (pos: any) => {
    setActiveTradeStock({
      ticker: pos.ticker,
      name: pos.name,
      price: pos.currentPrice,
      change: 0,
      change_percent: 0,
      high: pos.currentPrice * 1.01,
      low: pos.currentPrice * 0.99,
      open: pos.avgPrice,
      volume: 1000000
    });
    setTradeType('SELL');
    setTradeModalOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar />
      <TickerTape />

      <main className="main-layout" style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase style={{ color: 'var(--accent-blue)' }} size={26} /> Virtual Paper Trading Portfolio
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              Simulated ₹10,00,000 cash account for risk-free strategy validation on Indian equities
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your virtual portfolio to ₹10,00,000 cash?')) {
                resetPortfolio();
              }
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', color: 'var(--accent-red-bright)' }}
          >
            <RefreshCw size={14} /> Reset Virtual Account
          </button>
        </div>

        {/* Portfolio Overview Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL NET WORTH</div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', marginTop: '4px' }}>
              ₹{totalNetWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Invested + Cash Balance</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVAILABLE CASH</div>
            <div className="font-mono text-green" style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
              ₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Ready for new orders</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INVESTED VALUE</div>
            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)', marginTop: '4px' }}>
              ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Cost basis across {positions.length} holdings</div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL UNREALIZED P&L</div>
            <div className={`font-mono ${totalPnL >= 0 ? 'text-green' : 'text-red'}`} style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({totalPnLPercent.toFixed(2)}%)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Overall return on capital</div>
          </div>
        </div>

        {/* Current Holdings Table */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} style={{ color: 'var(--accent-green-bright)' }} /> Active Holdings ({positions.length})
          </h2>

          <div className="glass-card" style={{ padding: '16px' }}>
            {positions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                You have no active holdings in your virtual portfolio. Go to Chart or Watchlist to place a paper order!
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Mode</th>
                    <th>Qty</th>
                    <th>Avg Price</th>
                    <th>LTP (Current)</th>
                    <th>Invested</th>
                    <th>Current Value</th>
                    <th>Unrealized P&L</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const isProfit = pos.unrealizedPnL >= 0;
                    return (
                      <tr key={pos.id}>
                        <td>
                          <Link
                            href={`/chart/${pos.ticker}`}
                            onClick={() => setSelectedTicker(pos.ticker)}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            <div style={{ fontWeight: 800, color: 'var(--text-bright)', fontSize: '0.95rem' }}>{pos.ticker}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{pos.name}</div>
                          </Link>
                        </td>
                        <td>
                          <span className="badge badge-purple">{pos.mode.toUpperCase()}</span>
                        </td>
                        <td className="font-mono" style={{ fontWeight: 700 }}>{pos.quantity}</td>
                        <td className="font-mono">₹{pos.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="font-mono" style={{ fontWeight: 700 }}>₹{pos.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="font-mono">₹{pos.totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="font-mono" style={{ fontWeight: 700 }}>₹{pos.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className={`font-mono ${isProfit ? 'text-green' : 'text-red'}`} style={{ fontWeight: 800 }}>
                          {isProfit ? '+' : ''}₹{pos.unrealizedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({isProfit ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%)
                        </td>
                        <td>
                          <button
                            onClick={() => handleSellPosition(pos)}
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            EXIT / SELL
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Trade Execution History */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--accent-purple)' }} /> Complete Order Audit Log ({tradeHistory.length})
          </h2>

          <div className="glass-card" style={{ padding: '16px' }}>
            {tradeHistory.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No trade history recorded yet.
              </div>
            ) : (
              <table className="data-table font-mono" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Stock</th>
                    <th>Mode</th>
                    <th>Qty</th>
                    <th>Executed Price</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory.map((trd) => (
                    <tr key={trd.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {new Date(trd.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${trd.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>
                          {trd.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-bright)' }}>{trd.ticker}</td>
                      <td><span className="badge badge-blue">{trd.mode}</span></td>
                      <td>{trd.quantity}</td>
                      <td>₹{trd.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 700 }}>₹{trd.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <SearchModal />
      {activeTradeStock && (
        <PaperTradeModal
          stock={activeTradeStock}
          initialType={tradeType}
          isOpen={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
        />
      )}
    </div>
  );
}
