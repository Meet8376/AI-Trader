'use client';

import React from 'react';
import { Sliders, X, Check, Eye, EyeOff } from 'lucide-react';

export interface IndicatorConfig {
  showEma20: boolean;
  showEma50: boolean;
  showEma200: boolean;
  showVwap: boolean;
  showBollinger: boolean;
  showRsi: boolean;
  showMacd: boolean;
}

interface IndicatorSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IndicatorConfig;
  onChange: (newConfig: IndicatorConfig) => void;
}

export const IndicatorSelectorModal: React.FC<IndicatorSelectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof IndicatorConfig) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  const overlayIndicators = [
    { key: 'showEma20', label: 'Exponential Moving Average 20 (EMA 20)', color: '#ffb700', desc: 'Short-term trend overlay line' },
    { key: 'showEma50', label: 'Exponential Moving Average 50 (EMA 50)', color: '#8b5cf6', desc: 'Medium-term trend overlay line' },
    { key: 'showEma200', label: 'Exponential Moving Average 200 (EMA 200)', color: '#ef4444', desc: 'Long-term baseline trend line' },
    { key: 'showVwap', label: 'Volume Weighted Average Price (VWAP)', color: '#2962ff', desc: 'Intraday benchmark volume price anchor' },
    { key: 'showBollinger', label: 'Bollinger Bands (20, 2)', color: '#00b386', desc: 'Upper/Lower 2 StdDev volatility envelope' },
  ];

  const subPanelIndicators = [
    { key: 'showRsi', label: 'Relative Strength Index (RSI 14)', color: '#ec4899', desc: 'Dedicated oscillator panel with 70/30 levels' },
    { key: 'showMacd', label: 'MACD (12, 26, 9)', color: '#3b82f6', desc: 'Dedicated panel with MACD line, Signal & Histogram' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(31, 178, 232, 0.15)', color: 'var(--accent-blue)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <Sliders size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Technical Indicator Selector
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Toggle chart overlays & dedicated indicator sub-panels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Main Chart Overlays */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Chart Overlay Indicators
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {overlayIndicators.map((ind) => {
              const active = config[ind.key as keyof IndicatorConfig];
              return (
                <div
                  key={ind.key}
                  onClick={() => toggle(ind.key as keyof IndicatorConfig)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${active ? ind.color : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: ind.color,
                        boxShadow: active ? `0 0 8px ${ind.color}` : 'none'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)' }}>{ind.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ind.desc}</div>
                    </div>
                  </div>
                  <div style={{ color: active ? ind.color : 'var(--text-muted)' }}>
                    {active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dedicated Sub-Panels */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Sub-Panel Indicators (Oscillators)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {subPanelIndicators.map((ind) => {
              const active = config[ind.key as keyof IndicatorConfig];
              return (
                <div
                  key={ind.key}
                  onClick={() => toggle(ind.key as keyof IndicatorConfig)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${active ? ind.color : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: ind.color,
                        boxShadow: active ? `0 0 8px ${ind.color}` : 'none'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-bright)' }}>{ind.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ind.desc}</div>
                    </div>
                  </div>
                  <div style={{ color: active ? ind.color : 'var(--text-muted)' }}>
                    {active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Apply Indicator Settings
          </button>
        </div>
      </div>
    </div>
  );
};
