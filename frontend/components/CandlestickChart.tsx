'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, SeriesMarker } from 'lightweight-charts';
import { CandleData, TechnicalIndicators, StockQuote } from '../types/stock';
import { Activity, Zap, Layers, BarChart2, TrendingUp, Sliders, ShoppingBag } from 'lucide-react';

interface CandlestickChartProps {
  stock: StockQuote;
  candles: CandleData[];
  indicators?: TechnicalIndicators;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  onTriggerDebate?: () => void;
  isDebating?: boolean;
  onOpenTrade?: (type: 'BUY' | 'SELL') => void;
}

export type ChartType = 'candlestick' | 'line' | 'area' | 'bar';

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  stock,
  candles,
  indicators,
  timeframe,
  onTimeframeChange,
  onTriggerDebate,
  isDebating = false,
  onOpenTrade
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVwap, setShowVwap] = useState(true);

  const currencySymbol = '₹';

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const containerH = chartContainerRef.current.clientHeight || 480;
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#787b86',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: containerH,
      timeScale: {
        timeVisible: true,
        secondsVisible: timeframe === '1m',
        borderColor: 'rgba(42, 46, 57, 0.8)',
        rightOffset: 5,
        barSpacing: timeframe === '1m' ? 4 : timeframe === '5m' ? 5 : timeframe === '15m' ? 6 : 8,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(42, 46, 57, 0.8)',
      },
      crosshair: {
        mode: 0,
      },
      handleScale: true,
      handleScroll: true,
    });

    chartRef.current = chart;

    const parseTime = (t: string | number) => {
      if (typeof t === 'number') return t as any;
      const isoStr = t.includes('T') ? t : t.replace(' ', 'T');
      const timeMs = new Date(isoStr).getTime();
      return (isNaN(timeMs) ? Math.floor(Date.now() / 1000) : Math.floor(timeMs / 1000)) as any;
    };

    const formattedTimes = candles.map(c => parseTime(c.time));

    // 1. Primary Series based on chartType
    if (chartType === 'candlestick' || chartType === 'bar') {
      const mainSeries = chart.addCandlestickSeries({
        upColor: '#089981',
        downColor: '#f23645',
        borderVisible: false,
        wickUpColor: '#089981',
        wickDownColor: '#f23645',
      });
      mainSeries.setData(
        candles.map((c, i) => ({
          time: formattedTimes[i],
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
    } else if (chartType === 'area') {
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(41, 98, 255, 0.4)',
        bottomColor: 'rgba(41, 98, 255, 0.0)',
        lineColor: '#2962ff',
        lineWidth: 2,
      });
      areaSeries.setData(
        candles.map((c, i) => ({
          time: formattedTimes[i],
          value: c.close,
        }))
      );
    } else {
      // Line chart
      const lineSeries = chart.addLineSeries({
        color: '#2962ff',
        lineWidth: 2,
      });
      lineSeries.setData(
        candles.map((c, i) => ({
          time: formattedTimes[i],
          value: c.close,
        }))
      );
    }

    // 2. Volume Histogram Overlay
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c, i) => ({
        time: formattedTimes[i],
        value: c.volume,
        color: c.close >= c.open ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)',
      }))
    );

    // 3. Technical Indicator Overlays
    // EMA 20
    if (showEma20) {
      const ema20Series = chart.addLineSeries({
        color: '#ffb700',
        lineWidth: 1.5,
        title: 'EMA 20',
      });
      const k = 2 / (20 + 1);
      let ema = candles[0].close;
      const emaData = candles.map((c, i) => {
        ema = c.close * k + ema * (1 - k);
        return { time: formattedTimes[i], value: Math.round(ema * 100) / 100 };
      });
      ema20Series.setData(emaData);
    }

    // EMA 50
    if (showEma50) {
      const ema50Series = chart.addLineSeries({
        color: '#8b5cf6',
        lineWidth: 1.5,
        title: 'EMA 50',
      });
      const k = 2 / (50 + 1);
      let ema = candles[0].close;
      const emaData = candles.map((c, i) => {
        ema = c.close * k + ema * (1 - k);
        return { time: formattedTimes[i], value: Math.round(ema * 100) / 100 };
      });
      ema50Series.setData(emaData);
    }

    // VWAP
    if (showVwap) {
      const vwapSeries = chart.addLineSeries({
        color: '#2962ff',
        lineWidth: 1.5,
        lineStyle: 2,
        title: 'VWAP',
      });
      let cumVol = 0;
      let cumPV = 0;
      const vwapData = candles.map((c, i) => {
        const typicalPrice = (c.high + c.low + c.close) / 3;
        cumPV += typicalPrice * c.volume;
        cumVol += c.volume;
        const vwapVal = cumVol > 0 ? cumPV / cumVol : c.close;
        return { time: formattedTimes[i], value: Math.round(vwapVal * 100) / 100 };
      });
      vwapSeries.setData(vwapData);
    }

    // Set visible range: show a meaningful window per timeframe, scroll to latest
    const VISIBLE_BARS: Record<string, number> = {
      '1m':  100,
      '5m':  78,
      '15m': 60,
      '1h':  60,
      '1D':  60,
    };
    const visibleBars = VISIBLE_BARS[timeframe] ?? 60;
    const totalCandles = candles.length;

    if (totalCandles > 0) {
      const lastTime = formattedTimes[totalCandles - 1];
      const firstVisibleTime = formattedTimes[Math.max(0, totalCandles - visibleBars)];
      chart.timeScale().setVisibleRange({
        from: firstVisibleTime,
        to: lastTime,
      });
    } else {
      chart.timeScale().fitContent();
    }

    // Disconnect any previous ResizeObserver
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartRef.current) {
          const { width, height } = entry.contentRect;
          chartRef.current.applyOptions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    ro.observe(chartContainerRef.current);
    resizeObserverRef.current = ro;

    return () => {
      ro.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, chartType, showEma20, showEma50, showBollinger, showVwap, timeframe]);

  const isPositive = stock.change >= 0;

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Stock Quote Header Bar */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-secondary)'
        }}
      >
        {/* Ticker & Price Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                {stock.ticker}
              </span>
              <span className="badge badge-blue">NSE/BSE</span>
              {stock.sector && <span className="badge badge-purple">{stock.sector}</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{stock.name}</div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              {currencySymbol}{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className={`font-mono ${isPositive ? 'text-green' : 'text-red'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {isPositive ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{stock.change_percent.toFixed(2)}%)
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div>
              <div>Open: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>₹{stock.open}</span></div>
              <div>High: <span className="font-mono" style={{ color: 'var(--accent-green-bright)' }}>₹{stock.high}</span></div>
            </div>
            <div>
              <div>Low: <span className="font-mono" style={{ color: 'var(--accent-red-bright)' }}>₹{stock.low}</span></div>
              <div>Vol: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{(stock.volume / 100000).toFixed(2)}L</span></div>
            </div>
            {stock.pe_ratio && (
              <div>
                <div>P/E Ratio: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{stock.pe_ratio}</span></div>
                <div>Mkt Cap: <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>{stock.market_cap}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls & Order Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Paper Trade Buttons */}
          {onOpenTrade && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => onOpenTrade('BUY')}
                className="btn btn-success"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                BUY
              </button>
              <button
                onClick={() => onOpenTrade('SELL')}
                className="btn btn-danger"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                SELL
              </button>
            </div>
          )}

          {/* AI Debate Button */}
          {onTriggerDebate && (
            <button
              onClick={onTriggerDebate}
              disabled={isDebating}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              <Zap size={14} />
              {isDebating ? 'Debating...' : 'AI Debate'}
            </button>
          )}
        </div>
      </div>

      {/* Chart Toolbar (Timeframes & Indicator Toggles) */}
      <div
        style={{
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem'
        }}
      >
        {/* Timeframe Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Timeframe:</span>
          {['1m', '5m', '15m', '1h', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              style={{
                background: timeframe === tf ? 'var(--accent-blue)' : 'transparent',
                color: timeframe === tf ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Type:</span>
          {(['candlestick', 'line', 'area'] as ChartType[]).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              style={{
                background: chartType === t ? 'var(--bg-elevated)' : 'transparent',
                color: chartType === t ? 'var(--accent-blue)' : 'var(--text-secondary)',
                border: `1px solid ${chartType === t ? 'var(--accent-blue)' : 'transparent'}`,
                borderRadius: 'var(--radius-xs)',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Indicator Overlay Checkboxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showEma20} onChange={(e) => setShowEma20(e.target.checked)} />
            <span style={{ color: '#ffb700' }}>EMA 20</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showEma50} onChange={(e) => setShowEma50(e.target.checked)} />
            <span style={{ color: '#8b5cf6' }}>EMA 50</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showVwap} onChange={(e) => setShowVwap(e.target.checked)} />
            <span style={{ color: '#2962ff' }}>VWAP</span>
          </label>
        </div>
      </div>

      {/* Main Chart Container */}
      <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: '400px' }}>
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Indicators Summary Footer */}
      {indicators && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            padding: '8px 16px',
            display: 'flex',
            gap: '16px',
            fontSize: '0.75rem',
            alignItems: 'center',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} /> Analysis:
          </div>
          <div>
            RSI (14): <span className="font-mono" style={{ color: indicators.rsi > 70 ? 'var(--accent-red)' : indicators.rsi < 30 ? 'var(--accent-green-bright)' : 'var(--accent-blue)', fontWeight: 700 }}>{indicators.rsi}</span>
          </div>
          <div>
            VWAP: <span className="font-mono text-purple" style={{ fontWeight: 600 }}>₹{indicators.vwap}</span>
          </div>
          {indicators.pivot && (
            <div>
              Pivot (CPR): <span className="font-mono text-gold" style={{ fontWeight: 600 }}>₹{indicators.pivot}</span>
            </div>
          )}
          {indicators.resistance_1 && (
            <div>
              R1: <span className="font-mono text-red" style={{ fontWeight: 600 }}>₹{indicators.resistance_1}</span>
            </div>
          )}
          {indicators.support_1 && (
            <div>
              S1: <span className="font-mono text-green" style={{ fontWeight: 600 }}>₹{indicators.support_1}</span>
            </div>
          )}
          {indicators.supertrend && (
            <span className={`badge ${indicators.supertrend.includes('Bullish') ? 'badge-green' : 'badge-red'}`}>
              {indicators.supertrend}
            </span>
          )}
          <span className="badge badge-blue">{indicators.trend}</span>
        </div>
      )}
    </div>
  );
};
