import math
import logging
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import yfinance as yf
from app.models.schemas import StockQuote

logger = logging.getLogger(__name__)

# Complete Catalog of 50+ Indian NSE & BSE Bluechip and Midcap Stocks
STOCKS_DB = {
    # Top NIFTY 50 & Heavyweights
    "RELIANCE": {"name": "Reliance Industries Ltd", "price": 2985.40, "base": 2960.00, "market_cap": "₹20.19 Lakh Cr", "pe": 28.4, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "TCS": {"name": "Tata Consultancy Services Ltd", "price": 4180.20, "base": 4150.00, "market_cap": "₹15.12 Lakh Cr", "pe": 33.1, "sector": "IT SECTOR", "exchange": "NSE/BSE"},
    "HDFCBANK": {"name": "HDFC Bank Ltd", "price": 1645.10, "base": 1630.00, "market_cap": "₹12.52 Lakh Cr", "pe": 18.9, "sector": "BANKING", "exchange": "NSE/BSE"},
    "ICICIBANK": {"name": "ICICI Bank Ltd", "price": 1210.80, "base": 1195.00, "market_cap": "₹8.51 Lakh Cr", "pe": 17.4, "sector": "BANKING", "exchange": "NSE/BSE"},
    "BHARTIARTL": {"name": "Bharti Airtel Ltd", "price": 1475.25, "base": 1460.00, "market_cap": "₹8.72 Lakh Cr", "pe": 52.1, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "INFY": {"name": "Infosys Limited", "price": 1820.65, "base": 1840.00, "market_cap": "₹7.56 Lakh Cr", "pe": 26.8, "sector": "IT SECTOR", "exchange": "NSE/BSE"},
    "SBIN": {"name": "State Bank of India", "price": 845.75, "base": 835.00, "market_cap": "₹7.55 Lakh Cr", "pe": 11.8, "sector": "BANKING", "exchange": "NSE/BSE"},
    "ITC": {"name": "ITC Limited", "price": 492.50, "base": 488.00, "market_cap": "₹6.15 Lakh Cr", "pe": 28.1, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "HINDUNILVR": {"name": "Hindustan Unilever Ltd", "price": 2720.00, "base": 2695.00, "market_cap": "₹6.39 Lakh Cr", "pe": 55.4, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "LT": {"name": "Larsen & Toubro Ltd", "price": 3615.00, "base": 3580.00, "market_cap": "₹4.96 Lakh Cr", "pe": 34.5, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    
    # Auto & EV Sector
    "TATAMOTORS": {"name": "Tata Motors Ltd", "price": 1055.30, "base": 1040.00, "market_cap": "₹3.88 Lakh Cr", "pe": 14.2, "sector": "AUTO & EV", "exchange": "NSE/BSE"},
    "M&M": {"name": "Mahindra & Mahindra Ltd", "price": 2940.80, "base": 2890.00, "market_cap": "₹3.65 Lakh Cr", "pe": 31.2, "sector": "AUTO & EV", "exchange": "NSE/BSE"},
    "MARUTI": {"name": "Maruti Suzuki India Ltd", "price": 12450.00, "base": 12380.00, "market_cap": "₹3.91 Lakh Cr", "pe": 27.5, "sector": "AUTO & EV", "exchange": "NSE/BSE"},
    "BAJAJ-AUTO": {"name": "Bajaj Auto Ltd", "price": 9820.00, "base": 9710.00, "market_cap": "₹2.75 Lakh Cr", "pe": 34.6, "sector": "AUTO & EV", "exchange": "NSE/BSE"},
    "HEROMOTOCO": {"name": "Hero MotoCorp Ltd", "price": 5240.00, "base": 5190.00, "market_cap": "₹1.05 Lakh Cr", "pe": 24.8, "sector": "AUTO & EV", "exchange": "NSE/BSE"},
    "EICHERMOT": {"name": "Eicher Motors Ltd", "price": 4780.00, "base": 4720.00, "market_cap": "₹1.31 Lakh Cr", "pe": 33.4, "sector": "AUTO & EV", "exchange": "NSE/BSE"},

    # IT & Software Sector
    "HCLTECH": {"name": "HCL Technologies Ltd", "price": 1745.80, "base": 1720.00, "market_cap": "₹4.74 Lakh Cr", "pe": 28.9, "sector": "IT SECTOR", "exchange": "NSE/BSE"},
    "WIPRO": {"name": "Wipro Limited", "price": 535.90, "base": 528.00, "market_cap": "₹2.80 Lakh Cr", "pe": 23.5, "sector": "IT SECTOR", "exchange": "NSE/BSE"},
    "LTIM": {"name": "LTIMindtree Limited", "price": 5420.00, "base": 5360.00, "market_cap": "₹1.60 Lakh Cr", "pe": 34.0, "sector": "IT SECTOR", "exchange": "NSE/BSE"},
    "TECHM": {"name": "Tech Mahindra Ltd", "price": 1510.50, "base": 1485.00, "market_cap": "₹1.48 Lakh Cr", "pe": 48.2, "sector": "IT SECTOR", "exchange": "NSE/BSE"},
    "PERSISTENT": {"name": "Persistent Systems Ltd", "price": 4890.00, "base": 4810.00, "market_cap": "₹75,400 Cr", "pe": 54.1, "sector": "IT SECTOR", "exchange": "NSE/BSE"},

    # Banking & Financials
    "AXISBANK": {"name": "Axis Bank Ltd", "price": 1185.30, "base": 1170.00, "market_cap": "₹3.66 Lakh Cr", "pe": 14.5, "sector": "BANKING", "exchange": "NSE/BSE"},
    "KOTAKBANK": {"name": "Kotak Mahindra Bank Ltd", "price": 1790.40, "base": 1775.00, "market_cap": "₹3.56 Lakh Cr", "pe": 22.8, "sector": "BANKING", "exchange": "NSE/BSE"},
    "BAJFINANCE": {"name": "Bajaj Finance Limited", "price": 6840.00, "base": 6790.00, "market_cap": "₹4.22 Lakh Cr", "pe": 29.8, "sector": "BANKING", "exchange": "NSE/BSE"},
    "BAJAJFINSV": {"name": "Bajaj Finserv Ltd", "price": 1620.10, "base": 1600.00, "market_cap": "₹2.58 Lakh Cr", "pe": 32.4, "sector": "BANKING", "exchange": "NSE/BSE"},
    "INDUSINDBK": {"name": "IndusInd Bank Ltd", "price": 1390.60, "base": 1375.00, "market_cap": "₹1.08 Lakh Cr", "pe": 12.1, "sector": "BANKING", "exchange": "NSE/BSE"},
    "BANKBARODA": {"name": "Bank of Baroda", "price": 252.40, "base": 248.00, "market_cap": "₹1.30 Lakh Cr", "pe": 7.2, "sector": "BANKING", "exchange": "NSE/BSE"},
    "PNB": {"name": "Punjab National Bank", "price": 115.80, "base": 112.50, "market_cap": "₹1.27 Lakh Cr", "pe": 13.4, "sector": "BANKING", "exchange": "NSE/BSE"},

    # Energy, Power & Infrastructure
    "NTPC": {"name": "NTPC Limited", "price": 415.60, "base": 410.00, "market_cap": "₹4.03 Lakh Cr", "pe": 18.2, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "POWERGRID": {"name": "Power Grid Corp of India", "price": 342.10, "base": 338.00, "market_cap": "₹3.18 Lakh Cr", "pe": 19.5, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "ONGC": {"name": "Oil & Natural Gas Corp", "price": 325.40, "base": 320.00, "market_cap": "₹4.09 Lakh Cr", "pe": 8.4, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "BPCL": {"name": "Bharat Petroleum Corp Ltd", "price": 352.80, "base": 348.00, "market_cap": "₹1.53 Lakh Cr", "pe": 9.8, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "IOC": {"name": "Indian Oil Corporation Ltd", "price": 175.20, "base": 172.00, "market_cap": "₹2.47 Lakh Cr", "pe": 11.2, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "TATAPOWER": {"name": "Tata Power Co Ltd", "price": 438.50, "base": 430.00, "market_cap": "₹1.40 Lakh Cr", "pe": 38.0, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "ADANIGREEN": {"name": "Adani Green Energy Ltd", "price": 1780.00, "base": 1750.00, "market_cap": "₹2.82 Lakh Cr", "pe": 180.5, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "ADANIENT": {"name": "Adani Enterprises Ltd", "price": 3120.40, "base": 3080.00, "market_cap": "₹3.56 Lakh Cr", "pe": 98.2, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "ADANIPORTS": {"name": "Adani Ports & SEZ Ltd", "price": 1490.00, "base": 1465.00, "market_cap": "₹3.22 Lakh Cr", "pe": 35.8, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},

    # Metals, Cement & Industrial Materials
    "TATASTEEL": {"name": "Tata Steel Ltd", "price": 158.40, "base": 155.00, "market_cap": "₹1.97 Lakh Cr", "pe": 42.1, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "HINDALCO": {"name": "Hindalco Industries Ltd", "price": 645.20, "base": 638.00, "market_cap": "₹1.45 Lakh Cr", "pe": 14.2, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "JSWSTEEL": {"name": "JSW Steel Ltd", "price": 930.50, "base": 918.00, "market_cap": "₹2.27 Lakh Cr", "pe": 26.4, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "ULTRACEMCO": {"name": "UltraTech Cement Ltd", "price": 11240.00, "base": 11100.00, "market_cap": "₹3.31 Lakh Cr", "pe": 45.2, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},
    "GRASIM": {"name": "Grasim Industries Ltd", "price": 2680.00, "base": 2640.00, "market_cap": "₹1.82 Lakh Cr", "pe": 31.0, "sector": "ENERGY & INFRA", "exchange": "NSE/BSE"},

    # Pharma & Healthcare
    "SUNPHARMA": {"name": "Sun Pharmaceutical Inds", "price": 1725.30, "base": 1705.00, "market_cap": "₹4.14 Lakh Cr", "pe": 36.2, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "DRREDDY": {"name": "Dr. Reddy's Laboratories", "price": 6890.00, "base": 6820.00, "market_cap": "₹1.15 Lakh Cr", "pe": 21.4, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "CIPLA": {"name": "Cipla Limited", "price": 1580.00, "base": 1560.00, "market_cap": "₹1.28 Lakh Cr", "pe": 28.5, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "DIVISLAB": {"name": "Divi's Laboratories Ltd", "price": 4920.00, "base": 4850.00, "market_cap": "₹1.30 Lakh Cr", "pe": 72.8, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "APOLLOHOSP": {"name": "Apollo Hospitals Enterprise", "price": 6740.00, "base": 6650.00, "market_cap": "₹96,800 Cr", "pe": 84.2, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},

    # Consumer & Retail
    "TITAN": {"name": "Titan Company Ltd", "price": 3480.00, "base": 3440.00, "market_cap": "₹3.09 Lakh Cr", "pe": 82.5, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "ASIANPAINT": {"name": "Asian Paints Ltd", "price": 3040.00, "base": 3000.00, "market_cap": "₹2.91 Lakh Cr", "pe": 52.4, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "NESTLEIND": {"name": "Nestle India Ltd", "price": 2510.00, "base": 2480.00, "market_cap": "₹2.42 Lakh Cr", "pe": 76.1, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "BRITANNIA": {"name": "Britannia Industries Ltd", "price": 5680.00, "base": 5610.00, "market_cap": "₹1.37 Lakh Cr", "pe": 62.0, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "TATACONSUM": {"name": "Tata Consumer Products Ltd", "price": 1180.00, "base": 1165.00, "market_cap": "₹1.17 Lakh Cr", "pe": 85.0, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "DMART": {"name": "Avenue Supermarts Ltd (DMart)", "price": 4850.00, "base": 4790.00, "market_cap": "₹3.15 Lakh Cr", "pe": 115.0, "sector": "PHARMA & FMCG", "exchange": "NSE/BSE"},
    "ZOMATO": {"name": "Zomato Limited", "price": 265.40, "base": 258.00, "market_cap": "₹2.34 Lakh Cr", "pe": 145.0, "sector": "IT SECTOR", "exchange": "NSE/BSE"}
}

# Live market data memory caches with TTL
_QUOTE_CACHE: Dict[str, tuple] = {}
_CANDLE_CACHE: Dict[tuple, tuple] = {}
QUOTE_CACHE_TTL = 120  # seconds
CANDLE_CACHE_TTL = 300  # seconds

def _format_market_cap(mcap: Any) -> str:
    if not mcap or not isinstance(mcap, (int, float)) or mcap <= 0:
        return "N/A"
    if mcap >= 1e12:
        return f"₹{mcap / 1e12:.2f} Lakh Cr"
    elif mcap >= 1e7:
        return f"₹{mcap / 1e7:,.0f} Cr"
    return f"₹{mcap:,.0f}"

from app.services.angel_one_service import angel_one_service

def _fetch_yfinance_quote(ticker_symbol: str) -> Optional[StockQuote]:
    clean_symbol = ticker_symbol.upper().replace(".NS", "").replace(".BO", "")
    now = time.time()
    
    # Check quote cache
    if clean_symbol in _QUOTE_CACHE:
        cached_quote, ts = _QUOTE_CACHE[clean_symbol]
        if now - ts < QUOTE_CACHE_TTL:
            return cached_quote

    # 1. Try Angel One SmartAPI if connected
    if angel_one_service.is_connected:
        ao_quote = angel_one_service.get_market_quote(clean_symbol)
        if ao_quote:
            last_price = ao_quote["price"]
            prev_close = ao_quote["close"] if ao_quote["close"] > 0 else last_price
            change = round(last_price - prev_close, 2)
            change_percent = round((change / prev_close) * 100, 2) if prev_close > 0 else 0.0
            
            sq = StockQuote(
                ticker=clean_symbol,
                name=STOCKS_DB.get(clean_symbol, {}).get("name", f"{clean_symbol} Ltd"),
                price=last_price,
                change=change,
                change_percent=change_percent,
                high=ao_quote["high"] or round(last_price * 1.015, 2),
                low=ao_quote["low"] or round(last_price * 0.988, 2),
                open=ao_quote["open"] or round(last_price * 0.995, 2),
                volume=1500000,
                market_cap=STOCKS_DB.get(clean_symbol, {}).get("market_cap", "₹15,000 Cr"),
                pe_ratio=STOCKS_DB.get(clean_symbol, {}).get("pe", 22.5),
                day_range=f"₹{round(last_price*0.988, 2)} - ₹{round(last_price*1.015, 2)}"
            )
            _QUOTE_CACHE[clean_symbol] = (sq, now)
            return sq

    # 2. Try fetching from yfinance (.NS first, then .BO)
    for suffix in [".NS", ".BO"]:
        try:
            yf_ticker = f"{clean_symbol}{suffix}"
            tkr = yf.Ticker(yf_ticker)
            
            # Fetch recent 5-day history for accurate daily close and prev_close
            hist = tkr.history(period="5d", interval="1d")
            if hist.empty:
                continue

            last_price = round(float(hist['Close'].iloc[-1]), 2)
            prev_close = round(float(hist['Close'].iloc[-2]), 2) if len(hist) >= 2 else last_price
            open_price = round(float(hist['Open'].iloc[-1]), 2)
            day_high = round(float(hist['High'].iloc[-1]), 2)
            day_low = round(float(hist['Low'].iloc[-1]), 2)
            volume = int(hist['Volume'].iloc[-1]) if hist['Volume'].iloc[-1] > 0 else 1000000

            if last_price <= 0:
                continue

            change = round(last_price - prev_close, 2)
            change_percent = round((change / prev_close) * 100, 2) if prev_close > 0 else 0.0

            fast_info = tkr.fast_info
            mcap_val = getattr(fast_info, 'market_cap', None)
            market_cap_str = _format_market_cap(mcap_val) if mcap_val else STOCKS_DB.get(clean_symbol, {}).get("market_cap", "₹15,000 Cr")
            
            pe_val = getattr(fast_info, 'pe_ratio', None)
            pe_ratio = round(float(pe_val), 1) if pe_val and isinstance(pe_val, (int, float)) else STOCKS_DB.get(clean_symbol, {}).get("pe", 22.5)
            
            stock_name = STOCKS_DB.get(clean_symbol, {}).get("name", f"{clean_symbol} Ltd")

            quote = StockQuote(
                ticker=clean_symbol,
                name=stock_name,
                price=last_price,
                change=change,
                change_percent=change_percent,
                high=day_high,
                low=day_low,
                open=open_price,
                volume=volume,
                market_cap=market_cap_str,
                pe_ratio=pe_ratio,
                day_range=f"₹{day_low} - ₹{day_high}"
            )
            
            _QUOTE_CACHE[clean_symbol] = (quote, now)
            if clean_symbol in STOCKS_DB:
                STOCKS_DB[clean_symbol]["price"] = last_price
                STOCKS_DB[clean_symbol]["base"] = prev_close
            return quote

        except Exception as e:
            logger.warning(f"yfinance quote fetch failed for {clean_symbol}{suffix}: {e}")

    return None

def _fetch_yfinance_candles(ticker_symbol: str, timeframe: str = "15m", count: int = 60) -> Optional[List[Dict[str, Any]]]:
    clean_symbol = ticker_symbol.upper().replace(".NS", "").replace(".BO", "")
    cache_key = (clean_symbol, timeframe, count)
    now = time.time()
    
    if cache_key in _CANDLE_CACHE:
        cached_candles, ts = _CANDLE_CACHE[cache_key]
        if now - ts < CANDLE_CACHE_TTL:
            return cached_candles

    tf_map = {
        "1m": ("5d", "1m"),
        "5m": ("5d", "5m"),
        "15m": ("5d", "15m"),
        "1h": ("1mo", "60m"),
        "1D": ("6mo", "1d")
    }
    period, interval = tf_map.get(timeframe, ("5d", "15m"))
    
    for suffix in [".NS", ".BO"]:
        try:
            yf_ticker = f"{clean_symbol}{suffix}"
            tkr = yf.Ticker(yf_ticker)
            df = tkr.history(period=period, interval=interval)
            if df.empty:
                continue

            candles = []
            for idx, row in df.iterrows():
                if hasattr(idx, 'tz_convert'):
                    if idx.tzinfo is not None:
                        idx_ist = idx.tz_convert("Asia/Kolkata")
                    else:
                        idx_ist = idx.tz_localize("UTC").tz_convert("Asia/Kolkata")
                else:
                    idx_ist = idx

                if timeframe == "1D":
                    time_str = idx_ist.strftime("%Y-%m-%d")
                else:
                    time_str = idx_ist.strftime("%Y-%m-%d %H:%M")

                open_p = round(float(row['Open']), 2)
                high_p = round(float(row['High']), 2)
                low_p = round(float(row['Low']), 2)
                close_p = round(float(row['Close']), 2)
                volume = int(row['Volume'])

                if open_p > 0 and close_p > 0:
                    candles.append({
                        "time": time_str,
                        "open": open_p,
                        "high": high_p,
                        "low": low_p,
                        "close": close_p,
                        "volume": volume
                    })

            if candles:
                trimmed_candles = candles[-count:]
                _CANDLE_CACHE[cache_key] = (trimmed_candles, now)
                return trimmed_candles

        except Exception as e:
            logger.warning(f"yfinance candle fetch failed for {clean_symbol}{suffix}: {e}")

    return None


class StockService:
    @staticmethod
    def get_all_stocks(sector_filter: Optional[str] = None) -> List[StockQuote]:
        quotes = []
        for ticker, data in STOCKS_DB.items():
            if sector_filter and sector_filter.upper() != "ALL":
                if data.get("sector") != sector_filter.upper():
                    continue

            # Attempt live quote fetch via yfinance first
            live_quote = _fetch_yfinance_quote(ticker)
            if live_quote:
                quotes.append(live_quote)
                continue

            # Fallback quote if yfinance is unreachable
            change = round(data["price"] - data["base"], 2)
            change_percent = round((change / data["base"]) * 100, 2)
            quotes.append(StockQuote(
                ticker=ticker,
                name=data["name"],
                price=data["price"],
                change=change,
                change_percent=change_percent,
                high=round(data["price"] * 1.015, 2),
                low=round(data["price"] * 0.988, 2),
                open=round(data["base"] * 1.002, 2),
                volume=1500000,
                market_cap=data["market_cap"],
                pe_ratio=data["pe"],
                day_range=f"₹{round(data['price']*0.988, 2)} - ₹{round(data['price']*1.015, 2)}"
            ))
        return quotes

    @staticmethod
    def get_stock_by_ticker(ticker: str) -> Optional[StockQuote]:
        clean_ticker = ticker.upper().replace(".NS", "").replace(".BO", "")
        
        # 1. Try real live quote from yfinance
        live_quote = _fetch_yfinance_quote(clean_ticker)
        if live_quote:
            return live_quote

        # 2. Fallback to catalog or dynamic creation
        if clean_ticker not in STOCKS_DB:
            STOCKS_DB[clean_ticker] = {
                "name": f"{clean_ticker} India Ltd",
                "price": 1250.0,
                "base": 1240.0,
                "market_cap": "₹25,000 Cr",
                "pe": 25.0,
                "sector": "INDIAN NSE/BSE",
                "exchange": "NSE/BSE"
            }

        data = STOCKS_DB[clean_ticker]
        change = round(data["price"] - data["base"], 2)
        change_percent = round((change / data["base"]) * 100, 2)
        return StockQuote(
            ticker=clean_ticker,
            name=data["name"],
            price=data["price"],
            change=change,
            change_percent=change_percent,
            high=round(data["price"] * 1.015, 2),
            low=round(data["price"] * 0.988, 2),
            open=round(data["base"] * 1.002, 2),
            volume=1500000,
            market_cap=data["market_cap"],
            pe_ratio=data["pe"],
            day_range=f"₹{round(data['price']*0.988, 2)} - ₹{round(data['price']*1.015, 2)}"
        )

    @staticmethod
    def generate_candles(ticker: str, timeframe: str = "15m", count: int = 60) -> List[Dict[str, Any]]:
        clean_ticker = ticker.upper().replace(".NS", "").replace(".BO", "")
        
        # 1. Try Angel One SmartAPI candles if connected
        if angel_one_service.is_connected:
            ao_candles = angel_one_service.get_historical_candles(clean_ticker, timeframe=timeframe, count=count)
            if ao_candles and len(ao_candles) >= 5:
                return ao_candles

        # 2. Try real historical candles from yfinance
        real_candles = _fetch_yfinance_candles(clean_ticker, timeframe=timeframe, count=count)
        if real_candles and len(real_candles) >= 5:
            return real_candles

        # 2. Deterministic fallback generator anchored to stock current price (NO random jumps on reload!)
        stock = StockService.get_stock_by_ticker(clean_ticker)
        base_price = stock.price if stock else 1500.0

        now_utc = datetime.utcnow()
        ist_now = now_utc + timedelta(hours=5, minutes=30)
        curr_day = ist_now.date()

        if curr_day.weekday() == 5:
            curr_day -= timedelta(days=1)
        elif curr_day.weekday() == 6:
            curr_day -= timedelta(days=2)

        timestamps = []
        minutes_step = 15
        if timeframe == "1m": minutes_step = 1
        elif timeframe == "5m": minutes_step = 5
        elif timeframe == "1h": minutes_step = 60
        elif timeframe == "1D": minutes_step = 1440

        if timeframe == "1D":
            day_cursor = curr_day
            while len(timestamps) < count:
                if day_cursor.weekday() < 5:
                    timestamps.insert(0, day_cursor.strftime("%Y-%m-%d"))
                day_cursor -= timedelta(days=1)
        else:
            day_cursor = curr_day
            while len(timestamps) < count:
                if day_cursor.weekday() < 5:
                    start_t = datetime(day_cursor.year, day_cursor.month, day_cursor.day, 9, 15)
                    end_t = datetime(day_cursor.year, day_cursor.month, day_cursor.day, 15, 30)
                    
                    day_slots = []
                    t_slot = start_t
                    while t_slot <= end_t:
                        day_slots.append(t_slot.strftime("%Y-%m-%d %H:%M"))
                        t_slot += timedelta(minutes=minutes_step)
                    
                    timestamps = day_slots + timestamps
                day_cursor -= timedelta(days=1)
            
            timestamps = timestamps[-count:]

        # Seed pseudo-randomness deterministically from ticker name so it's 100% stable on reload!
        ticker_seed = sum(ord(c) * (idx + 1) for idx, c in enumerate(clean_ticker))
        count_n = len(timestamps)
        
        # Realistic financial random walk with momentum & volatility (No Sine Waves!)
        returns = []
        prev_r = 0.0
        for i in range(count_n):
            # Deterministic LCG hash producing values in [-0.5, 0.5]
            h = (i * 2654435761 + ticker_seed * 1013904223) & 0xFFFFFFFF
            raw_val = (h / 4294967296.0) - 0.5
            
            # Momentum + random market shock
            r = 0.35 * prev_r + 0.65 * (raw_val * 0.007)
            returns.append(r)
            prev_r = r

        # Calculate cumulative price path
        cum_multipliers = [1.0]
        for r in returns:
            cum_multipliers.append(cum_multipliers[-1] * (1.0 + r))

        # Anchor price path to end precisely at current stock live price
        final_mult = cum_multipliers[-1]
        adjusted_multipliers = [m / final_mult for m in cum_multipliers[1:]]

        candles = []
        for i, ts in enumerate(timestamps):
            close_p = base_price * adjusted_multipliers[i]
            prev_close_p = base_price * (adjusted_multipliers[i-1] if i > 0 else (adjusted_multipliers[i] * 0.998))
            
            open_p = prev_close_p
            
            # Realistic wicks and high/low bounds
            h_val = ((i * 1103515245 + ticker_seed) & 0xFFFFFFFF) / 4294967296.0
            wick_top = max(open_p, close_p) * (1.0 + h_val * 0.0025)
            wick_bot = min(open_p, close_p) * (1.0 - (1.0 - h_val) * 0.0025)

            high_p = max(open_p, close_p, wick_top)
            low_p = min(open_p, close_p, wick_bot)

            # Realistic volume profile
            vol_hash = ((i * 1664525 + ticker_seed * 22695477) & 0xFFFFFFFF) / 4294967296.0
            vol = int(120000 + vol_hash * 450000)

            candles.append({
                "time": ts,
                "open": round(open_p, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "close": round(close_p, 2),
                "volume": vol
            })

        return candles


