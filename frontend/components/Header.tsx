'use client';

import React, { useState } from 'react';
import { TradingMode } from '../types/stock';
import { Bot, Zap, TrendingUp, Key, ShieldCheck, X } from 'lucide-react';

interface HeaderProps {
  mode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
  marketStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({ mode, onModeChange, marketStatus = "LIVE" }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header style={{
        height: '64px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AI-Trader <span className="badge bg-purple-badge" style={{ fontSize: '0.65rem' }}>✨ GEMINI 2026</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Realtime Multi-Agent Trading Intelligence
            </div>
          </div>
        </div>

        {/* Mode Selector (Intraday vs Long-Term) */}
        <div style={{
          background: 'var(--bg-primary)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => onModeChange('intraday')}
            className="btn"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              fontSize: '0.8rem',
              border: 'none',
              background: mode === 'intraday' ? 'var(--accent-blue)' : 'transparent',
              color: mode === 'intraday' ? '#fff' : 'var(--text-secondary)',
              fontWeight: mode === 'intraday' ? 600 : 400
            }}
          >
            <Zap size={14} /> Intraday Mode (15m)
          </button>
          <button
            onClick={() => onModeChange('long-term')}
            className="btn"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              fontSize: '0.8rem',
              border: 'none',
              background: mode === 'long-term' ? 'var(--accent-purple)' : 'transparent',
              color: mode === 'long-term' ? '#fff' : 'var(--text-secondary)',
              fontWeight: mode === 'long-term' ? 600 : 400
            }}
          >
            <TrendingUp size={14} /> Long-Term Mode (1D)
          </button>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Market Live Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-green)',
              boxShadow: '0 0 8px var(--accent-green)'
            }} />
            US / NSE {marketStatus}
          </div>

          {/* API Setup Modal Button */}
          <button className="btn" style={{ fontSize: '0.78rem' }} onClick={() => setShowModal(true)}>
            <Key size={14} /> API Setup
          </button>
        </div>
      </header>

      {/* Glassmorphic API Setup Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            width: '450px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--accent-gold)" /> API Settings & Status
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '2px' }}>✨ Google Gemini LLM Engine</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: <span className="text-green">Active (API Key Saved in .env)</span></div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '2px' }}>📈 Alpha Vantage Stock Data</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: <span className="text-green">Active (API Key Saved in .env)</span></div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                To modify keys or add Zerodha Kite / Dhan broker credentials, update <code>/home/meet/Documents/AI-Trader/.env</code>.
              </div>

              <button className="btn btn-primary" onClick={() => setShowModal(false)} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
