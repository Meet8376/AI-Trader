'use client';

import React from 'react';
import { TopPick } from '../types/debate';
import { TradingMode } from '../types/stock';
import { Sparkles } from 'lucide-react';

interface TopPicksProps {
  picks: TopPick[];
  mode: TradingMode;
  onSelectTicker: (ticker: string) => void;
}

export const TopPicks: React.FC<TopPicksProps> = ({ picks, mode, onSelectTicker }) => {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent-gold)" />
          Indian NSE/BSE AI Top Recommended Picks ({mode.toUpperCase()})
        </div>
        <span className="badge bg-purple-badge" style={{ fontSize: '0.7rem' }}>
          ✨ Gemini Consensus Ranked
        </span>
      </div>

      <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
        {picks.map((pick) => {
          const isPositive = pick.change >= 0;
          const currencySymbol = '₹';

          return (
            <div
              key={pick.ticker}
              onClick={() => onSelectTicker(pick.ticker)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                {/* Header Rank + Signal */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--accent-blue-bg)',
                      color: 'var(--accent-blue)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{pick.rank}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pick.ticker}</span>
                  </div>
                  <span className="badge bg-green-badge" style={{ fontSize: '0.72rem' }}>
                    {pick.signal}
                  </span>
                </div>

                {/* Name & Price */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {pick.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {currencySymbol}{pick.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {isPositive ? '+' : ''}{pick.change_percent}%
                  </span>
                </div>

                {/* AI Rationale */}
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
                  {pick.rationale}
                </p>
              </div>

              {/* Score & Targets */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem'
              }}>
                <div>
                  Score: <span className="mono text-gold" style={{ fontWeight: 700 }}>{pick.consensus_score}/10</span>
                </div>
                <div className="mono text-green" style={{ fontWeight: 600 }}>
                  Target: {currencySymbol}{pick.target_price}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
