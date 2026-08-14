'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { CandleData, TechnicalIndicators, StockQuote } from '../types/stock';
import {
  calculateEMA,
  calculateVWAP,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '../lib/indicators';
import { IndicatorSelectorModal, IndicatorConfig } from './IndicatorSelectorModal';
import {
  Activity,
  Zap,
  Sliders,
  Maximize2,
  Crosshair,
  TrendingUp,
  Minus,
  Trash2,
  Plus,
  BarChart2,
  Layers,
  X
} from 'lucide-react';

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

export interface DrawnPriceLine {
  id: string;
  price: number;
  title: string;
  color: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  stock,
  candles,
  indicators,
  timeframe,
  onTimeframeChange,
  onTriggerDebate,
  isDebating = false,
  onOpenTrade,
}) => {
  // Chart refs
  const mainChartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);

  // States
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig>({
    showEma20: true,
    showEma50: true,
    showEma200: false,
    showVwap: true,
    showBollinger: false,
    showRsi: true,
    showMacd: true,
  });

  // Active Tool state & Drawn Price Lines
  const [activeTool, setActiveTool] = useState<'crosshair' | 'resistance' | 'support' | 'line'>('crosshair');
  const [drawnLines, setDrawnLines] = useState<DrawnPriceLine[]>([]);

  const currencySymbol = '₹';

  // Helper to add line
  const handleAddPriceLine = (type: 'resistance' | 'support' | 'custom') => {
    let p = stock.price;
    let color = '#00b386';
    let title = 'Support';

    if (type === 'resistance') {
      p = stock.high || stock.price * 1.015;
      color = '#f23645';
      title = 'Resistance';
    } else if (type === 'support') {
      p = stock.low || stock.price * 0.985;
      color = '#089981';
      title = 'Support';
    } else {
      const input = prompt('Enter Price Level for Line:', stock.price.toString());
      if (!input || isNaN(Number(input))) return;
      p = Number(input);
      title = `Line @ ₹${p}`;
      color = '#1fb2e8';
    }

    const newLine: DrawnPriceLine = {
      id: Date.now().toString(),
      price: Math.round(p * 100) / 100,
      title: `${title} (₹${Math.round(p * 100) / 100})`,
      color,
    };
    setDrawnLines((prev) => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    setDrawnLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClearAllLines = () => {
    setDrawnLines([]);
  };

  // Main Chart & Indicators Effect
  useEffect(() => {
    if (!mainChartContainerRef.current || candles.length === 0) return;

    // Cleanup previous charts
    if (mainChartRef.current) {
      mainChartRef.current.remove();
      mainChartRef.current = null;
    }
    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
      rsiChartRef.current = null;
    }
    if (macdChartRef.current) {
      macdChartRef.current.remove();
      macdChartRef.current = null;
    }

    const parseTime = (t: string | number) => {
      if (typeof t === 'number') return t as any;
      const isoStr = t.includes('T') ? t : t.replace(' ', 'T');
      const timeMs = new Date(isoStr).getTime();
      return (isNaN(timeMs) ? Math.floor(Date.now() / 1000) : Math.floor(timeMs / 1000)) as any;
    };

    const formattedTimes = candles.map((c) => parseTime(c.time));

    // 1. Render Main Chart
    const mainHeight = mainChartContainerRef.current.clientHeight || 360;
    const mainChart = createChart(mainChartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#787b86',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.4)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.4)' },
      },
      width: mainChartContainerRef.current.clientWidth,
      height: mainHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: timeframe === '1m',
        borderColor: 'rgba(42, 46, 57, 0.8)',
        rightOffset: 5,
        barSpacing: timeframe === '1m' ? 5 : timeframe === '5m' ? 6 : 8,
      },
      rightPriceScale: {
        borderColor: 'rgba(42, 46, 57, 0.8)',
      },
      crosshair: { mode: 0 },
      handleScale: true,
      handleScroll: true,
    });
    mainChartRef.current = mainChart;

    // Series creation
    let mainSeries: ISeriesApi<any>;
    if (chartType === 'candlestick' || chartType === 'bar') {
      mainSeries = mainChart.addCandlestickSeries({
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
      mainSeries = mainChart.addAreaSeries({
        topColor: 'rgba(41, 98, 255, 0.4)',
        bottomColor: 'rgba(41, 98, 255, 0.0)',
        lineColor: '#2962ff',
        lineWidth: 2,
      });
      mainSeries.setData(candles.map((c, i) => ({ time: formattedTimes[i], value: c.close })));
    } else {
      mainSeries = mainChart.addLineSeries({ lineColor: '#2962ff', lineWidth: 2 });
      mainSeries.setData(candles.map((c, i) => ({ time: formattedTimes[i], value: c.close })));
    }
    mainSeriesRef.current = mainSeries;

    // Volume Histogram
    const volumeSeries = mainChart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
    volumeSeries.setData(
      candles.map((c, i) => ({
        time: formattedTimes[i],
        value: c.volume,
        color: c.close >= c.open ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)',
      }))
    );

    // Render Overlays
    if (indicatorConfig.showEma20) {
      const ema20Data = calculateEMA(candles, formattedTimes, 20);
      const s = mainChart.addLineSeries({ color: '#ffb700', lineWidth: 1.5, title: 'EMA 20' });
      s.setData(ema20Data);
    }
    if (indicatorConfig.showEma50) {
      const ema50Data = calculateEMA(candles, formattedTimes, 50);
      const s = mainChart.addLineSeries({ color: '#8b5cf6', lineWidth: 1.5, title: 'EMA 50' });
      s.setData(ema50Data);
    }
    if (indicatorConfig.showEma200) {
      const ema200Data = calculateEMA(candles, formattedTimes, 200);
      const s = mainChart.addLineSeries({ color: '#ef4444', lineWidth: 1.5, title: 'EMA 200' });
      s.setData(ema200Data);
    }
    if (indicatorConfig.showVwap) {
      const vwapData = calculateVWAP(candles, formattedTimes);
      const s = mainChart.addLineSeries({ color: '#2962ff', lineWidth: 1.5, lineStyle: 2, title: 'VWAP' });
      s.setData(vwapData);
    }
    if (indicatorConfig.showBollinger) {
      const bbData = calculateBollingerBands(candles, formattedTimes, 20, 2);
      const upperS = mainChart.addLineSeries({ color: '#00b386', lineWidth: 1, title: 'BB Upper' });
      const midS = mainChart.addLineSeries({ color: '#089981', lineWidth: 1.5, lineStyle: 2, title: 'BB Mid' });
      const lowerS = mainChart.addLineSeries({ color: '#00b386', lineWidth: 1, title: 'BB Lower' });

      upperS.setData(bbData.map((b) => ({ time: b.time, value: b.upper })));
      midS.setData(bbData.map((b) => ({ time: b.time, value: b.middle })));
      lowerS.setData(bbData.map((b) => ({ time: b.time, value: b.lower })));
    }

    // Render User Drawn Price Lines
    drawnLines.forEach((line) => {
      mainSeries.createPriceLine({
        price: line.price,
        color: line.color,
        lineWidth: 2,
        lineStyle: 0,
        axisLabelVisible: true,
        title: line.title,
      });
    });

    // 2. Render RSI Sub-Panel Chart
    if (indicatorConfig.showRsi && rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#131722' },
          textColor: '#787b86',
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
          horzLines: { color: 'rgba(42, 46, 57, 0.3)' },
        },
        width: rsiContainerRef.current.clientWidth,
        height: 120,
        timeScale: { visible: false },
        rightPriceScale: { borderColor: 'rgba(42, 46, 57, 0.8)' },
        crosshair: { mode: 0 },
      });
      rsiChartRef.current = rsiChart;

      const rsiData = calculateRSI(candles, formattedTimes, 14);
      const rsiSeries = rsiChart.addLineSeries({ color: '#ec4899', lineWidth: 1.5, title: 'RSI (14)' });
      rsiSeries.setData(rsiData);

      // Overbought 70 & Oversold 30 lines
      rsiSeries.createPriceLine({ price: 70, color: '#ef4444', lineWidth: 1, lineStyle: 2, title: 'OB 70' });
      rsiSeries.createPriceLine({ price: 30, color: '#10b981', lineWidth: 1, lineStyle: 2, title: 'OS 30' });
      rsiSeries.createPriceLine({ price: 50, color: '#6b7280', lineWidth: 1, lineStyle: 3, title: '' });
    }

    // 3. Render MACD Sub-Panel Chart
    if (indicatorConfig.showMacd && macdContainerRef.current) {
      const macdChart = createChart(macdContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#131722' },
          textColor: '#787b86',
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
          horzLines: { color: 'rgba(42, 46, 57, 0.3)' },
        },
        width: macdContainerRef.current.clientWidth,
        height: 130,
        timeScale: { visible: true, borderColor: 'rgba(42, 46, 57, 0.8)' },
        rightPriceScale: { borderColor: 'rgba(42, 46, 57, 0.8)' },
        crosshair: { mode: 0 },
      });
      macdChartRef.current = macdChart;

      const macdData = calculateMACD(candles, formattedTimes);

      // MACD & Signal Lines
      const macdSeries = macdChart.addLineSeries({ color: '#3b82f6', lineWidth: 1.5, title: 'MACD' });
      const signalSeries = macdChart.addLineSeries({ color: '#f97316', lineWidth: 1.5, title: 'Signal' });
      const histSeries = macdChart.addHistogramSeries({ title: 'Histogram' });

      macdSeries.setData(macdData.map((m) => ({ time: m.time, value: m.macd })));
      signalSeries.setData(macdData.map((m) => ({ time: m.time, value: m.signal })));
      histSeries.setData(
        macdData.map((m) => ({
          time: m.time,
          value: m.histogram,
          color: m.histogram >= 0 ? 'rgba(8, 153, 129, 0.7)' : 'rgba(242, 54, 69, 0.7)',
        }))
      );

      macdSeries.createPriceLine({ price: 0, color: '#4b5563', lineWidth: 1, lineStyle: 3, title: '' });
    }

    // 4. TimeScale Synchronization
    const syncTimeScale = (main: IChartApi, sub: IChartApi) => {
      main.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) sub.timeScale().setVisibleLogicalRange(range);
      });
    };

    if (rsiChartRef.current) syncTimeScale(mainChart, rsiChartRef.current);
    if (macdChartRef.current) syncTimeScale(mainChart, macdChartRef.current);

    // Initial visible range
    const total = candles.length;
    if (total > 0) {
      const VISIBLE_BARS: Record<string, number> = {
        '1m': 100,
        '5m': 78,
        '15m': 60,
        '1h': 60,
        '1D': 60,
      };
      const bars = VISIBLE_BARS[timeframe] ?? 60;
      const lastT = formattedTimes[total - 1];
      const firstT = formattedTimes[Math.max(0, total - bars)];

      mainChart.timeScale().setVisibleRange({ from: firstT, to: lastT });
    }

    // ResizeObserver
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (mainChartRef.current) mainChartRef.current.applyOptions({ width: Math.floor(width) });
        if (rsiChartRef.current) rsiChartRef.current.applyOptions({ width: Math.floor(width) });
        if (macdChartRef.current) macdChartRef.current.applyOptions({ width: Math.floor(width) });
      }
    });

    if (mainChartContainerRef.current) ro.observe(mainChartContainerRef.current);

    return () => {
      ro.disconnect();
      if (mainChartRef.current) mainChartRef.current.remove();
      if (rsiChartRef.current) rsiChartRef.current.remove();
      if (macdChartRef.current) macdChartRef.current.remove();
    };
  }, [candles, chartType, indicatorConfig, drawnLines, timeframe]);

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

      {/* Chart Top Toolbar (Timeframes, Chart Type, Indicator Selector Modal Trigger) */}
      <div
        style={{
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          flexWrap: 'wrap',
          gap: '8px'
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

        {/* Indicator Selector Modal Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIndicatorModalOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sliders size={14} style={{ color: 'var(--accent-blue)' }} />
            Indicators
            <span
              style={{
                background: 'var(--accent-blue)',
                color: '#fff',
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700
              }}
            >
              {Object.values(indicatorConfig).filter(Boolean).length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Chart Section with Left Drawing Toolbar */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Drawing Tools Sidebar */}
        <div
          style={{
            width: '42px',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 4px',
            gap: '8px',
            zIndex: 10
          }}
        >
          <button
            onClick={() => setActiveTool('crosshair')}
            title="Crosshair Pointer"
            style={{
              background: activeTool === 'crosshair' ? 'var(--bg-tertiary)' : 'transparent',
              color: activeTool === 'crosshair' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: activeTool === 'crosshair' ? '1px solid var(--accent-blue)' : 'none',
              borderRadius: 'var(--radius-xs)',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <Crosshair size={16} />
          </button>

          <button
            onClick={() => handleAddPriceLine('resistance')}
            title="Add Resistance Line (High Level)"
            style={{
              background: 'transparent',
              color: '#f23645',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <TrendingUp size={16} />
          </button>

          <button
            onClick={() => handleAddPriceLine('support')}
            title="Add Support Line (Low Level)"
            style={{
              background: 'transparent',
              color: '#089981',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <Minus size={16} />
          </button>

          <button
            onClick={() => handleAddPriceLine('custom')}
            title="Add Custom Price Level Line"
            style={{
              background: 'transparent',
              color: 'var(--accent-blue)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
          </button>

          {drawnLines.length > 0 && (
            <button
              onClick={handleClearAllLines}
              title="Clear All Price Lines"
              style={{
                background: 'transparent',
                color: 'var(--accent-red-bright)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                padding: '6px',
                marginTop: 'auto',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Center Canvas Area: Main Chart + RSI Panel + MACD Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Main Candlestick Chart Canvas */}
          <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
            <div ref={mainChartContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Active Drawn Lines Badges */}
            {drawnLines.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '12px',
                  display: 'flex',
                  gap: '6px',
                  zIndex: 5,
                  flexWrap: 'wrap'
                }}
              >
                {drawnLines.map((line) => (
                  <span
                    key={line.id}
                    style={{
                      background: 'rgba(19, 23, 34, 0.85)',
                      border: `1px solid ${line.color}`,
                      color: line.color,
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {line.title}
                    <X
                      size={12}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveLine(line.id)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dedicated RSI Sub-Panel Chart */}
          {indicatorConfig.showRsi && (
            <div
              style={{
                height: '120px',
                borderTop: '1px solid var(--border-color)',
                position: 'relative',
                background: '#131722'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '8px',
                  zIndex: 5,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Activity size={12} /> RSI (14)
              </div>
              <div ref={rsiContainerRef} style={{ width: '100%', height: '100%' }} />
            </div>
          )}

          {/* Dedicated MACD Sub-Panel Chart */}
          {indicatorConfig.showMacd && (
            <div
              style={{
                height: '130px',
                borderTop: '1px solid var(--border-color)',
                position: 'relative',
                background: '#131722'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '8px',
                  zIndex: 5,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <BarChart2 size={12} /> MACD (12, 26, 9)
              </div>
              <div ref={macdContainerRef} style={{ width: '100%', height: '100%' }} />
            </div>
          )}
        </div>
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
            <Activity size={14} /> Technical Summary:
          </div>
          <div>
            RSI: <span className="font-mono" style={{ color: indicators.rsi > 70 ? 'var(--accent-red)' : indicators.rsi < 30 ? 'var(--accent-green-bright)' : 'var(--accent-blue)', fontWeight: 700 }}>{indicators.rsi}</span>
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

      {/* Indicator Selector Modal */}
      <IndicatorSelectorModal
        isOpen={indicatorModalOpen}
        onClose={() => setIndicatorModalOpen(false)}
        config={indicatorConfig}
        onChange={setIndicatorConfig}
      />
    </div>
  );
};
