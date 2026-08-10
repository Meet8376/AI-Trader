'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { CandleData, TechnicalIndicators, StockQuote } from '../types/stock';
import { Activity, Zap } from 'lucide-react';

interface CandlestickChartProps {
  stock: StockQuote;
  candles: CandleData[];
  indicators?: TechnicalIndicators;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  onTriggerDebate: () => void;
  isDebating: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  stock,
  candles,
  indicators,
  timeframe,
  onTimeframeChange,
  onTriggerDebate,
  isDebating
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const currencySymbol = '₹';

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear previous instance if exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e17' },
        textColor: '#9ca3af',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00e676',
      downColor: '#ff1744',
      borderVisible: false,
      wickUpColor: '#00e676',
      wickDownColor: '#ff1744',
    });

    const formattedCandles = candles.map(c => ({
      time: Math.floor(new Date(c.time).getTime() / 1000) as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candlestickSeries.setData(formattedCandles);

    // 2. Volume Histogram Overlay
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const formattedVolume = candles.map(c => ({
      time: Math.floor(new Date(c.time).getTime() / 1000) as any,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 23, 68, 0.3)',
    }));
    volumeSeries.setData(formattedVolume);

    // Fit content
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles]);

  const isPositive = stock.change >= 0;

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <div className="card-header" style={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, marginRight: '8px' }}>{stock.ticker}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stock.name}</span>
          </div>
          <div className="mono" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            {currencySymbol}{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {isPositive ? '+' : ''}{stock.change} ({isPositive ? '+' : ''}{stock.change_percent}%)
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Timeframe selector buttons */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '2px' }}>
            {['1m', '5m', '15m', '1h', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                style={{
                  background: timeframe === tf ? 'var(--accent-blue)' : 'transparent',
                  color: timeframe === tf ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Trigger Agent Debate Button */}
          <button
            onClick={onTriggerDebate}
            disabled={isDebating}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <Zap size={14} />
            {isDebating ? "Debating..." : "Start AI Debate"}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '350px' }}>
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Technical Indicators Bar */}
      {indicators && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          padding: '8px 16px',
          display: 'flex',
          gap: '24px',
          fontSize: '0.75rem',
          alignItems: 'center',
          overflowX: 'auto'
        }}>
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} /> Indicators:
          </div>
          <div>
            RSI (14): <span className="mono" style={{ color: indicators.rsi > 70 ? 'var(--accent-red)' : indicators.rsi < 30 ? 'var(--accent-green)' : 'var(--accent-blue)', fontWeight: 600 }}>{indicators.rsi}</span>
          </div>
          <div>
            EMA (20): <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currencySymbol}{indicators.ema_20}</span>
          </div>
          <div>
            EMA (50): <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currencySymbol}{indicators.ema_50}</span>
          </div>
          <div>
            VWAP: <span className="mono" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{currencySymbol}{indicators.vwap}</span>
          </div>
          <div>
            Trend: <span className="badge bg-blue-badge" style={{ fontSize: '0.7rem' }}>{indicators.trend}</span>
          </div>
        </div>
      )}
    </div>
  );
};
