import { CandleData } from '../types/stock';

export interface IndicatorPoint {
  time: any;
  value: number;
}

export interface MacdPoint {
  time: any;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerPoint {
  time: any;
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: CandleData[], times: any[], period: number): IndicatorPoint[] {
  if (candles.length === 0) return [];
  const k = 2 / (period + 1);
  let ema = candles[0].close;
  return candles.map((c, i) => {
    ema = c.close * k + ema * (1 - k);
    return { time: times[i], value: Math.round(ema * 100) / 100 };
  });
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(candles: CandleData[], times: any[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push({ time: times[i], value: candles[i].close });
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push({ time: times[i], value: Math.round((sum / period) * 100) / 100 });
  }
  return result;
}

/**
 * Calculate Volume Weighted Average Price (VWAP)
 */
export function calculateVWAP(candles: CandleData[], times: any[]): IndicatorPoint[] {
  let cumVol = 0;
  let cumPV = 0;
  return candles.map((c, i) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumPV += typicalPrice * c.volume;
    cumVol += c.volume;
    const vwapVal = cumVol > 0 ? cumPV / cumVol : c.close;
    return { time: times[i], value: Math.round(vwapVal * 100) / 100 };
  });
}

/**
 * Calculate Relative Strength Index (RSI 14)
 */
export function calculateRSI(candles: CandleData[], times: any[], period = 14): IndicatorPoint[] {
  if (candles.length < 2) return [];
  
  const rsiData: IndicatorPoint[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  // First period
  for (let i = 1; i <= period && i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  // Initial RSI point
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  rsiData.push({ time: times[0], value: 50 }); // fallback for index 0

  for (let i = 1; i < candles.length; i++) {
    if (i <= period) {
      rsiData.push({ time: times[i], value: Math.round(rsi * 100) / 100 });
      continue;
    }
    const change = candles[i].close - candles[i - 1].close;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
    rsiData.push({ time: times[i], value: Math.round(rsi * 10) / 10 });
  }

  return rsiData;
}

/**
 * Calculate MACD (12, 26, 9)
 */
export function calculateMACD(candles: CandleData[], times: any[]): MacdPoint[] {
  if (candles.length === 0) return [];
  const ema12 = calculateEMA(candles, times, 12);
  const ema26 = calculateEMA(candles, times, 26);

  const macdLine = ema12.map((e, i) => Math.round((e.value - ema26[i].value) * 100) / 100);
  
  // Signal line (9-period EMA of MACD Line)
  const k9 = 2 / (9 + 1);
  let signal = macdLine[0];
  const macdPoints: MacdPoint[] = [];

  for (let i = 0; i < candles.length; i++) {
    const macdVal = macdLine[i];
    signal = macdVal * k9 + signal * (1 - k9);
    const signalVal = Math.round(signal * 100) / 100;
    const histVal = Math.round((macdVal - signalVal) * 100) / 100;

    macdPoints.push({
      time: times[i],
      macd: macdVal,
      signal: signalVal,
      histogram: histVal
    });
  }

  return macdPoints;
}

/**
 * Calculate Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(candles: CandleData[], times: any[], period = 20, multiplier = 2): BollingerPoint[] {
  const sma = calculateSMA(candles, times, period);
  const points: BollingerPoint[] = [];

  for (let i = 0; i < candles.length; i++) {
    const mid = sma[i].value;
    if (i < period - 1) {
      points.push({ time: times[i], upper: mid * 1.02, middle: mid, lower: mid * 0.98 });
      continue;
    }
    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - mid, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    points.push({
      time: times[i],
      upper: Math.round((mid + multiplier * stdDev) * 100) / 100,
      middle: Math.round(mid * 100) / 100,
      lower: Math.round((mid - multiplier * stdDev) * 100) / 100
    });
  }

  return points;
}
