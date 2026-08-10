import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
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

class StockService:
    @staticmethod
    def get_all_stocks(sector_filter: Optional[str] = None) -> List[StockQuote]:
        quotes = []
        for ticker, data in STOCKS_DB.items():
            if sector_filter and sector_filter.upper() != "ALL":
                if data.get("sector") != sector_filter.upper():
                    continue

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
                volume=random.randint(500000, 4500000),
                market_cap=data["market_cap"],
                pe_ratio=data["pe"],
                day_range=f"₹{round(data['price']*0.988, 2)} - ₹{round(data['price']*1.015, 2)}"
            ))
        return quotes

    @staticmethod
    def get_stock_by_ticker(ticker: str) -> Optional[StockQuote]:
        t = ticker.upper()

        if t not in STOCKS_DB:
            try:
                import yfinance as yf
                yf_ticker = f"{t}.NS"
                tkr = yf.Ticker(yf_ticker)
                info = tkr.fast_info
                last_price = round(float(info.last_price), 2)
                prev_close = round(float(info.previous_close), 2)
                if last_price and last_price > 0:
                    STOCKS_DB[t] = {
                        "name": f"{t} Ltd (NSE)",
                        "price": last_price,
                        "base": prev_close if prev_close > 0 else round(last_price * 0.99, 2),
                        "market_cap": "₹15,000 Cr",
                        "pe": 22.5,
                        "sector": "INDIAN NSE/BSE",
                        "exchange": "NSE"
                    }
            except Exception as e:
                logger.info(f"yfinance lookup for {t} failed, using dynamic generator: {e}")

        if t not in STOCKS_DB:
            STOCKS_DB[t] = {
                "name": f"{t} India Ltd",
                "price": 1250.0,
                "base": 1240.0,
                "market_cap": "₹25,000 Cr",
                "pe": 25.0,
                "sector": "INDIAN NSE/BSE",
                "exchange": "NSE/BSE"
            }

        data = STOCKS_DB[t]
        change = round(data["price"] - data["base"], 2)
        change_percent = round((change / data["base"]) * 100, 2)
        return StockQuote(
            ticker=t,
            name=data["name"],
            price=data["price"],
            change=change,
            change_percent=change_percent,
            high=round(data["price"] * 1.015, 2),
            low=round(data["price"] * 0.988, 2),
            open=round(data["base"] * 1.002, 2),
            volume=random.randint(500000, 4500000),
            market_cap=data["market_cap"],
            pe_ratio=data["pe"],
            day_range=f"₹{round(data['price']*0.988, 2)} - ₹{round(data['price']*1.015, 2)}"
        )


    @staticmethod
    def generate_candles(ticker: str, timeframe: str = "15m", count: int = 60) -> List[Dict[str, Any]]:
        t = ticker.upper()
        base_price = STOCKS_DB.get(t, {}).get("price", 1500.0)

        # Convert local time to IST (UTC + 5:30)
        now_utc = datetime.utcnow()
        ist_now = now_utc + timedelta(hours=5, minutes=30)
        curr_day = ist_now.date()

        # If weekend, start from Friday
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
            # Daily candles: 1 per trading day (Mon-Fri)
            day_cursor = curr_day
            while len(timestamps) < count:
                if day_cursor.weekday() < 5:
                    timestamps.insert(0, day_cursor.strftime("%Y-%m-%d"))
                day_cursor -= timedelta(days=1)
        else:
            # Intraday candles: Strictly 09:15 AM to 03:30 PM IST
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

        candles = []
        curr_price = base_price * 0.975

        for ts in timestamps:
            change_pct = (random.random() - 0.47) * 0.01
            open_p = curr_price
            close_p = open_p * (1 + change_pct)
            high_p = max(open_p, close_p) * (1 + random.random() * 0.004)
            low_p = min(open_p, close_p) * (1 - random.random() * 0.004)
            vol = random.randint(15000, 350000)

            candles.append({
                "time": ts,
                "open": round(open_p, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "close": round(close_p, 2),
                "volume": vol
            })
            curr_price = close_p

        return candles
