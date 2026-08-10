import numpy as np
import pandas as pd
from typing import List, Dict, Any

class IndicatorService:
    @staticmethod
    def calculate_indicators(candles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate technical indicators from candle data."""
        if not candles:
            return {}

        df = pd.DataFrame(candles)
        closes = df['close'].values
        highs = df['high'].values
        lows = df['low'].values
        volumes = df['volume'].values

        # 1. RSI (14 period)
        rsi = IndicatorService._calc_rsi(closes, period=14)

        # 2. MACD (12, 26, 9)
        macd_line, signal_line, histogram = IndicatorService._calc_macd(closes)

        # 3. Bollinger Bands (20 period, 2 std)
        upper_bb, middle_bb, lower_bb = IndicatorService._calc_bollinger(closes)

        # 4. EMAs
        ema_20 = IndicatorService._calc_ema(closes, period=20)
        ema_50 = IndicatorService._calc_ema(closes, period=50)

        # 5. VWAP
        vwap = (df['close'] * df['volume']).cumsum() / df['volume'].cumsum()
        latest_vwap = float(vwap.iloc[-1]) if len(vwap) > 0 else float(closes[-1])

        # Trend assessment
        current_price = float(closes[-1])
        latest_rsi = float(rsi[-1])
        latest_macd_hist = float(histogram[-1])

        if current_price > ema_20[-1] and latest_rsi > 55 and latest_macd_hist > 0:
            trend = "Strong Bullish"
        elif current_price > ema_20[-1]:
            trend = "Bullish"
        elif current_price < ema_20[-1] and latest_rsi < 45 and latest_macd_hist < 0:
            trend = "Strong Bearish"
        else:
            trend = "Consolidating / Neutral"

        return {
            "rsi": round(latest_rsi, 2),
            "macd": {
                "macd": round(float(macd_line[-1]), 2),
                "signal": round(float(signal_line[-1]), 2),
                "histogram": round(latest_macd_hist, 2)
            },
            "bollinger": {
                "upper": round(float(upper_bb[-1]), 2),
                "middle": round(float(middle_bb[-1]), 2),
                "lower": round(float(lower_bb[-1]), 2)
            },
            "ema_20": round(float(ema_20[-1]), 2),
            "ema_50": round(float(ema_50[-1]), 2),
            "vwap": round(latest_vwap, 2),
            "trend": trend
        }

    @staticmethod
    def _calc_rsi(prices: np.ndarray, period: int = 14) -> np.ndarray:
        deltas = np.diff(prices)
        seed = deltas[:period+1]
        up = seed[seed >= 0].sum() / period
        down = -seed[seed < 0].sum() / period
        rs = up / down if down != 0 else 0
        rsi = np.zeros_like(prices)
        rsi[:period] = 100. - 100. / (1. + rs)

        for i in range(period, len(prices)):
            delta = deltas[i - 1]
            if delta > 0:
                upval = delta
                downval = 0.
            else:
                upval = 0.
                downval = -delta

            up = (up * (period - 1) + upval) / period
            down = (down * (period - 1) + downval) / period
            rs = up / down if down != 0 else 0
            rsi[i] = 100. - 100. / (1. + rs)

        return rsi

    @staticmethod
    def _calc_macd(prices: np.ndarray, fast: int = 12, slow: int = 26, signal: int = 9):
        fast_ema = IndicatorService._calc_ema(prices, fast)
        slow_ema = IndicatorService._calc_ema(prices, slow)
        macd_line = fast_ema - slow_ema
        signal_line = IndicatorService._calc_ema(macd_line, signal)
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram

    @staticmethod
    def _calc_bollinger(prices: np.ndarray, period: int = 20, num_std: int = 2):
        df_p = pd.Series(prices)
        sma = df_p.rolling(window=period, min_periods=1).mean().values
        std = df_p.rolling(window=period, min_periods=1).std().fillna(0).values
        upper = sma + (std * num_std)
        lower = sma - (std * num_std)
        return upper, sma, lower

    @staticmethod
    def _calc_ema(prices: np.ndarray, period: int) -> np.ndarray:
        df_p = pd.Series(prices)
        return df_p.ewm(span=period, adjust=False).mean().values
