"""
Diagnostic script: Test yfinance data quality for NSE/BSE Indian stocks.
Run from: /home/meet/Documents/AI-Trader/backend
Usage: python3 -m app.scripts.diagnose_stocks
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import yfinance as yf
import time

TICKERS = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS", "SBIN", "ZOMATO"]

print("="*70)
print("NSE/BSE yfinance Data Diagnostic Report")
print("="*70)

for ticker in TICKERS:
    for suffix in [".NS", ".BO"]:
        symbol = f"{ticker}{suffix}"
        try:
            tkr = yf.Ticker(symbol)

            # Test 1: 5-day daily history (used for quotes)
            hist = tkr.history(period="5d", interval="1d")
            if hist.empty:
                print(f"[{symbol}] DAILY HIST: Empty ❌")
                continue

            last_close = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) >= 2 else last_close
            day_high = hist['High'].iloc[-1]
            day_low = hist['Low'].iloc[-1]
            day_open = hist['Open'].iloc[-1]
            volume = hist['Volume'].iloc[-1]
            change = last_close - prev_close
            change_pct = (change / prev_close) * 100

            print(f"\n[{symbol}] ✅ QUOTE:")
            print(f"  Last Close : ₹{last_close:.2f}")
            print(f"  Prev Close : ₹{prev_close:.2f}")
            print(f"  Change     : ₹{change:.2f} ({change_pct:.2f}%)")
            print(f"  Day High   : ₹{day_high:.2f}")
            print(f"  Day Low    : ₹{day_low:.2f}")
            print(f"  Open       : ₹{day_open:.2f}")
            print(f"  Volume     : {int(volume):,}")

            # Test 2: 5-day 15m candles
            hist_15m = tkr.history(period="5d", interval="15m")
            if hist_15m.empty:
                print(f"  15m Candles: Empty ❌")
            else:
                print(f"  15m Candles: {len(hist_15m)} bars ✅")
                last = hist_15m.iloc[-1]
                print(f"  Last 15m : O={last['Open']:.2f} H={last['High']:.2f} L={last['Low']:.2f} C={last['Close']:.2f}")

            # Only test first working exchange suffix
            break
        except Exception as e:
            print(f"[{symbol}] ERROR: {e}")

print("\n" + "="*70)
print("Diagnostic complete.")
