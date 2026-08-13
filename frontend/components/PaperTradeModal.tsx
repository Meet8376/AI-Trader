'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useTraderStore } from '../store/useTraderStore';
import { StockQuote } from '../types/stock';

interface Props {
  stock: StockQuote;
  initialType?: 'BUY' | 'SELL';
  isOpen: boolean;
  onClose: () => void;
}

export const PaperTradeModal: React.FC<Props> = ({ stock, initialType = 'BUY', isOpen, onClose }) => {
  const [type, setType] = useState<'BUY' | 'SELL'>(initialType);
  const [quantity, setQuantity] = useState<number>(10);
  const [tradeStatus, setTradeStatus] = useState<{ success: boolean; message: string } | null>(null);

  const executeTrade = useTraderStore((state) => state.executeTrade);
  const cashBalance = useTraderStore((state) => state.cashBalance);
  const tradingMode = useTraderStore((state) => state.tradingMode);
  const positions = useTraderStore((state) => state.positions);

  if (!isOpen) return null;

  const currentHolding = positions.find((p) => p.ticker === stock.ticker && p.mode === tradingMode);
  const totalAmount = quantity * stock.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeStatus(null);

    const res = executeTrade(stock.ticker, stock.name, type, quantity, stock.price);
    setTradeStatus(res);

    if (res.success) {
      setTimeout(() => {
        setTradeStatus(null);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-bright)' }}>
                {stock.ticker}
              </span>
              <span className="badge badge-purple">{tradingMode.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* BUY / SELL Switcher */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              gap: '4px',
              marginBottom: '20px'
            }}
          >
            <button
              type="button"
              onClick={() => setType('BUY')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: type === 'BUY' ? 'var(--accent-green)' : 'transparent',
                color: type === 'BUY' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              BUY (Instant Paper)
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: type === 'SELL' ? 'var(--accent-red)' : 'transparent',
                color: type === 'SELL' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              SELL (Short/Exit)
            </button>
          </div>

          {/* Current Market Price & Holdings */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}
          >
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>LTP (Market)</div>
              <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.05rem' }}>
                ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Holding ({tradingMode})</div>
              <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                {currentHolding ? `${currentHolding.quantity} Qty` : '0 Qty'}
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Quantity (Shares)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: 'var(--text-bright)',
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {/* Quantity Quick Selector Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[5, 10, 25, 50, 100].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                style={{
                  flex: 1,
                  background: quantity === q ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
                  border: `1px solid ${quantity === q ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {q} Qty
              </button>
            ))}
          </div>

          {/* Order Summary Box */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Total Order Value:</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-bright)' }}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Available Cash:</span>
              <span className="font-mono" style={{ color: 'var(--accent-green-bright)' }}>
                ₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Trade Notification Feedback */}
          {tradeStatus && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: tradeStatus.success ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                color: tradeStatus.success ? 'var(--accent-green-bright)' : 'var(--accent-red-bright)',
                border: `1px solid ${tradeStatus.success ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)'}`
              }}
            >
              {tradeStatus.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{tradeStatus.message}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            className={`btn ${type === 'BUY' ? 'btn-success' : 'btn-danger'}`}
            style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 700 }}
          >
            <ShoppingBag size={18} />
            CONFIRM {type} ({quantity} Shares)
          </button>
        </form>
      </div>
    </div>
  );
};
