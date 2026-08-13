'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, X, ShieldAlert, CheckCircle, TrendingUp, IndianRupee } from 'lucide-react';
import { StockQuote } from '../types/stock';
import { DebateVerdict } from '../types/debate';

interface PositionSizerModalProps {
  stock: StockQuote;
  verdict?: DebateVerdict | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PositionSizerModal: React.FC<PositionSizerModalProps> = ({
  stock,
  verdict,
  isOpen,
  onClose,
}) => {
  const [capital, setCapital] = useState<number>(100000); // Default 1 Lakh INR
  const [riskPercent, setRiskPercent] = useState<number>(2); // Default 2% risk
  const [entryPrice, setEntryPrice] = useState<number>(stock?.price || 1000);
  const [targetPrice, setTargetPrice] = useState<number>(verdict ? verdict.target_price : Math.round((stock?.price || 1000) * 1.035 * 100) / 100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(verdict ? verdict.stop_loss : Math.round((stock?.price || 1000) * 0.985 * 100) / 100);

  useEffect(() => {
    if (stock) {
      setEntryPrice(stock.price);
      setTargetPrice(verdict ? verdict.target_price : Math.round(stock.price * 1.035 * 100) / 100);
      setStopLossPrice(verdict ? verdict.stop_loss : Math.round(stock.price * 0.985 * 100) / 100);
    }
  }, [stock, verdict, isOpen]);

  if (!isOpen) return null;

  const currencySymbol = '₹';

  // Calculations
  const maxRiskAmount = (capital * riskPercent) / 100;
  const riskPerShare = Math.max(0.1, Math.abs(entryPrice - stopLossPrice));
  const rewardPerShare = Math.max(0.1, Math.abs(targetPrice - entryPrice));

  const calculatedShares = Math.floor(maxRiskAmount / riskPerShare);
  const totalCapitalRequired = Math.round(calculatedShares * entryPrice);
  const totalPotentialProfit = Math.round(calculatedShares * rewardPerShare);
  const totalActualRisk = Math.round(calculatedShares * riskPerShare);
  const rrRatio = Math.round((rewardPerShare / riskPerShare) * 100) / 100;

  const capitalExceeded = totalCapitalRequired > capital;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
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
        width: '540px',
        maxWidth: '90vw',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        color: 'var(--text-primary)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={22} color="var(--accent-blue)" />
            AI Trade Position & Risk Calculator
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stock Banner */}
        <div style={{
          background: 'var(--bg-primary)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{stock.ticker} - {stock.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Price: <span className="mono" style={{ fontWeight: 600 }}>{currencySymbol}{stock.price}</span></div>
          </div>
          {verdict && (
            <span className={`badge ${verdict.verdict === 'BUY' ? 'bg-green-badge' : 'bg-red-badge'}`}>
              AI Signal: {verdict.verdict} ({verdict.confidence}%)
            </span>
          )}
        </div>

        {/* Form Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {/* Account Capital */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Account Capital (₹)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px'
            }}>
              <IndianRupee size={14} color="var(--text-muted)" style={{ marginRight: '6px' }} />
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Risk Percentage */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Max Risk per Trade (% Capital)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px'
            }}>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: '100%' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>

          {/* Entry Price */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Entry Price (₹)
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                color: '#fff',
                fontSize: '0.85rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          {/* Target Price */}
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--accent-green)', display: 'block', marginBottom: '4px' }}>
              Target Price (₹)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--accent-green-bg)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                color: 'var(--accent-green)',
                fontWeight: 600,
                fontSize: '0.85rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>

          {/* Stop Loss Price */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--accent-red)', display: 'block', marginBottom: '4px' }}>
              Stop Loss Price (₹)
            </label>
            <input
              type="number"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(Number(e.target.value))}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--accent-red-bg)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                color: 'var(--accent-red)',
                fontWeight: 600,
                fontSize: '0.85rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Calculation Results Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(41, 121, 255, 0.1), rgba(124, 77, 255, 0.1))',
          border: '1px solid var(--accent-blue)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '0.82rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Calculated Shares</div>
            <div className="mono text-blue" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {calculatedShares.toLocaleString('en-IN')} Qty
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Risk : Reward Ratio</div>
            <div className="mono text-purple" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              1 : {rrRatio}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Total Capital Required</div>
            <div className="mono" style={{ fontWeight: 600 }}>
              {currencySymbol}{totalCapitalRequired.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Max Capital Risked</div>
            <div className="mono text-red" style={{ fontWeight: 600 }}>
              {currencySymbol}{totalActualRisk.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Potential Net Profit</div>
            <div className="mono text-green" style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={16} /> +{currencySymbol}{totalPotentialProfit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Warning if Capital Exceeded */}
        {capitalExceeded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-red-bg)',
            color: 'var(--accent-red)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            marginTop: '12px'
          }}>
            <ShieldAlert size={16} />
            Required capital ({currencySymbol}{totalCapitalRequired.toLocaleString('en-IN')}) exceeds account balance. Consider using Zerodha MIS intraday leverage (5x) or reducing risk %.
          </div>
        )}

        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
          Apply Strategy Parameters
        </button>
      </div>
    </div>
  );
};
