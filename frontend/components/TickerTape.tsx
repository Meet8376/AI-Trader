'use client';

import React from 'react';
import { useTraderStore } from '../store/useTraderStore';

export const TickerTape: React.FC = () => {
  const indices = useTraderStore((state) => state.indices);
  const setSelectedTicker = useTraderStore((state) => state.setSelectedTicker);

  // Duplicate items for continuous seamless loop
  const items = [...indices, ...indices, ...indices];

  return (
    <div className="ticker-tape-container">
      <div className="ticker-tape-track">
        {items.map((idx, index) => {
          const isUp = idx.change >= 0;
          return (
            <div key={`${idx.symbol}-${index}`} className="ticker-item">
              <span style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{idx.name}</span>
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`font-mono ${isUp ? 'text-green' : 'text-red'}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
              >
                {isUp ? '▲' : '▼'} {Math.abs(idx.change).toFixed(2)} ({isUp ? '+' : ''}{idx.change_percent.toFixed(2)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
