import random
import httpx
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models.schemas import StockQuote, CandleData
from app.config import settings

logger = logging.getLogger(__name__)

# Expanded stock catalog covering US Tech/Finance/Auto & Indian NSE Bluechips
STOCKS_DB = {
    # US Tech & AI Leaders
    "NVDA": {"name": "NVIDIA Corporation", "price": 128.80, "base": 124.50, "market_cap": "$3.16 T", "pe": 68.5, "sector": "US TECH", "country": "US"},
    "AAPL": {"name": "Apple Inc", "price": 224.50, "base": 222.10, "market_cap": "$3.42 T", "pe": 34.2, "sector": "US TECH", "country": "US"},
    "MSFT": {"name": "Microsoft Corporation", "price": 448.20, "base": 445.00, "market_cap": "$3.33 T", "pe": 36.8, "sector": "US TECH", "country": "US"},
    "GOOGL": {"name": "Alphabet Inc", "price": 178.60, "base": 176.80, "market_cap": "$2.20 T", "pe": 26.1, "sector": "US TECH", "country": "US"},
    "AMZN": {"name": "Amazon.com Inc", "price": 186.30, "base": 184.10, "market_cap": "$1.94 T", "pe": 42.5, "sector": "US TECH", "country": "US"},
    "META": {"name": "Meta Platforms Inc", "price": 512.40, "base": 505.20, "market_cap": "$1.30 T", "pe": 28.9, "sector": "US TECH", "country": "US"},
    "TSLA": {"name": "Tesla Inc", "price": 218.40, "base": 210.00, "market_cap": "$695 B", "pe": 58.4, "sector": "AUTOMOTIVE", "country": "US"},
    "AMD": {"name": "Advanced Micro Devices", "price": 156.20, "base": 152.80, "market_cap": "$253 B", "pe": 45.2, "sector": "US TECH", "country": "US"},
    "NFLX": {"name": "Netflix Inc", "price": 645.10, "base": 638.00, "market_cap": "$278 B", "pe": 41.0, "sector": "US TECH", "country": "US"},
    "JPM": {"name": "JPMorgan Chase & Co", "price": 208.50, "base": 206.10, "market_cap": "$594 B", "pe": 12.4, "sector": "BANKING", "country": "US"},

    # Indian NSE Bluechips (NIFTY 50)
    "RELIANCE": {"name": "Reliance Industries Ltd", "price": 2985.40, "base": 2980.00, "market_cap": "₹20.19 T", "pe": 28.4, "sector": "INDIAN NSE", "country": "IN"},
    "TCS": {"name": "Tata Consultancy Services", "price": 4180.20, "base": 4150.00, "market_cap": "₹15.12 T", "pe": 33.1, "sector": "INDIAN NSE", "country": "IN"},
    "INFY": {"name": "Infosys Limited", "price": 1820.65, "base": 1840.00, "market_cap": "₹7.56 T", "pe": 26.8, "sector": "INDIAN NSE", "country": "IN"},
    "HDFCBANK": {"name": "HDFC Bank Ltd", "price": 1645.10, "base": 1630.00, "market_cap": "₹12.52 T", "pe": 18.9, "sector": "BANKING", "country": "IN"},
    "ICICIBANK": {"name": "ICICI Bank Ltd", "price": 1210.80, "base": 1195.00, "market_cap": "₹8.51 T", "pe": 17.4, "sector": "BANKING", "country": "IN"},
    "TATAMOTORS": {"name": "Tata Motors Ltd", "price": 1055.30, "base": 1040.00, "market_cap": "₹3.88 T", "pe": 14.2, "sector": "AUTOMOTIVE", "country": "IN"},
    "SBIN": {"name": "State Bank of India", "price": 845.75, "base": 855.00, "market_cap": "₹7.55 T", "pe": 11.8, "sector": "BANKING", "country": "IN"},
    "WIPRO": {"name": "Wipro Limited", "price": 535.90, "base": 528.00, "market_cap": "₹2.80 T", "pe": 23.5, "sector": "INDIAN NSE", "country": "IN"},
    "ADANIENT": {"name": "Adani Enterprises Ltd", "price": 3120.40, "base": 3080.00, "market_cap": "₹3.56 T", "pe": 98.2, "sector": "INDIAN NSE", "country": "IN"},
    "BHARTIARTL": {"name": "Bharti Airtel Ltd", "price": 1475.25, "base": 1460.00, "market_cap": "₹8.72 T", "pe": 72.1, "sector": "INDIAN NSE", "country": "IN"},
    "LTIM": {"name": "LTIMindtree Limited", "price": 5420.00, "base": 5360.00, "market_cap": "₹1.60 T", "pe": 34.0, "sector": "INDIAN NSE", "country": "IN"},
    "ITC": {"name": "ITC Limited", "price": 492.50, "base": 488.00, "market_cap": "₹6.15 T", "pe": 28.1, "sector": "INDIAN NSE", "country": "IN"},
    "LT": {"name": "Larsen & Toubro Ltd", "price": 3615.00, "base": 3580.00, "market_cap": "₹4.96 T", "pe": 38.5, "sector": "INDIAN NSE", "country": "IN"},
    "SUNPHARMA": {"name": "Sun Pharmaceutical Inds", "price": 1725.30, "base": 1705.00, "market_cap": "₹4.14 T", "pe": 36.2, "sector": "INDIAN NSE", "country": "IN"},
    "BAJFINANCE": {"name": "Bajaj Finance Limited", "price": 6840.00, "base": 6790.00, "market_cap": "₹4.22 T", "pe": 29.8, "sector": "BANKING", "country": "IN"}
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
                day_range=f"{round(data['price']*0.988, 2)} - {round(data['price']*1.015, 2)}"
            ))
        return quotes

    @staticmethod
    def get_stock_by_ticker(ticker: str) -> Optional[StockQuote]:
        t = ticker.upper()
        
        # Try fetching real quote from Alpha Vantage if user ticker is US stock
        if t in ["AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "AMD", "NFLX", "JPM"]:
            real_quote = StockService._fetch_alphavantage_quote(t)
            if real_quote:
                return real_quote

        if t not in STOCKS_DB:
            STOCKS_DB[t] = {"name": f"{t} Corp", "price": 150.0, "base": 148.0, "market_cap": "$10 B", "pe": 20.0, "sector": "US TECH", "country": "US"}

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
            day_range=f"{round(data['price']*0.988, 2)} - {round(data['price']*1.015, 2)}"
        )

    @staticmethod
    def generate_candles(ticker: str, timeframe: str = "15m", count: int = 100) -> List[Dict[str, Any]]:
        t = ticker.upper()

        if t in ["AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]:
            real_candles = StockService._fetch_alphavantage_candles(t, timeframe, count)
            if real_candles and len(real_candles) > 10:
                return real_candles

        # Fallback realistic chart candle generation
        base_price = STOCKS_DB.get(t, {}).get("price", 150.0)
        now = datetime.now()
        candles = []
        curr_price = base_price * 0.95

        minutes_step = 15
        if timeframe == "1m": minutes_step = 1
        elif timeframe == "5m": minutes_step = 5
        elif timeframe == "1h": minutes_step = 60
        elif timeframe == "1D": minutes_step = 1440

        for i in range(count):
            candle_time = (now - timedelta(minutes=minutes_step * (count - i))).strftime("%Y-%m-%d %H:%M")
            change_pct = (random.random() - 0.47) * 0.012
            open_p = curr_price
            close_p = open_p * (1 + change_pct)
            high_p = max(open_p, close_p) * (1 + random.random() * 0.005)
            low_p = min(open_p, close_p) * (1 - random.random() * 0.005)
            vol = random.randint(15000, 350000)

            candles.append({
                "time": candle_time,
                "open": round(open_p, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "close": round(close_p, 2),
                "volume": vol
            })
            curr_price = close_p

        if t in STOCKS_DB:
            STOCKS_DB[t]["price"] = round(curr_price, 2)

        return candles

    @staticmethod
    def _fetch_alphavantage_quote(ticker: str) -> Optional[StockQuote]:
        api_key = settings.ALPHA_VANTAGE_API_KEY
        if not api_key:
            return None
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={api_key}"
        try:
            with httpx.Client(timeout=3.5) as client:
                res = client.get(url)
                if res.status_code == 200:
                    data = res.json().get("Global Quote", {})
                    if data and "05. price" in data:
                        price = float(data["05. price"])
                        change = float(data.get("09. change", "0"))
                        change_percent_str = data.get("10. change percent", "0%").replace("%", "")
                        change_percent = float(change_percent_str)
                        high = float(data.get("03. high", price * 1.01))
                        low = float(data.get("04. low", price * 0.99))
                        open_p = float(data.get("02. open", price))
                        vol = int(data.get("06. volume", 100000))
                        
                        return StockQuote(
                            ticker=ticker,
                            name=STOCKS_DB.get(ticker, {}).get("name", f"{ticker} Inc"),
                            price=round(price, 2),
                            change=round(change, 2),
                            change_percent=round(change_percent, 2),
                            high=round(high, 2),
                            low=round(low, 2),
                            open=round(open_p, 2),
                            volume=vol,
                            market_cap=STOCKS_DB.get(ticker, {}).get("market_cap", "$100 B"),
                            pe_ratio=STOCKS_DB.get(ticker, {}).get("pe", 25.0),
                            day_range=f"{round(low, 2)} - {round(high, 2)}"
                        )
        except Exception as e:
            logger.warning(f"Alpha Vantage quote fetch failed for {ticker}: {e}")
        return None

    @staticmethod
    def _fetch_alphavantage_candles(ticker: str, timeframe: str, count: int) -> Optional[List[Dict[str, Any]]]:
        api_key = settings.ALPHA_VANTAGE_API_KEY
        if not api_key:
            return None
        interval = "15min"
        if timeframe in ["1m", "5m", "15m", "60m"]:
            interval = timeframe.replace("h", "min")
        
        function = "TIME_SERIES_INTRADAY" if timeframe in ["1m", "5m", "15m", "1h"] else "TIME_SERIES_DAILY"
        url = f"https://www.alphavantage.co/query?function={function}&symbol={ticker}&apikey={api_key}"
        if function == "TIME_SERIES_INTRADAY":
            url += f"&interval={interval}"

        try:
            with httpx.Client(timeout=3.5) as client:
                res = client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    series_key = [k for k in data.keys() if "Time Series" in k]
                    if series_key:
                        time_series = data[series_key[0]]
                        candles = []
                        for time_str, values in list(time_series.items())[:count]:
                            candles.append({
                                "time": time_str,
                                "open": float(values["1. open"]),
                                "high": float(values["2. high"]),
                                "low": float(values["3. low"]),
                                "close": float(values["4. close"]),
                                "volume": int(values["5. volume"])
                            })
                        return sorted(candles, key=lambda x: x["time"])
        except Exception as e:
            logger.warning(f"Alpha Vantage candles fetch failed for {ticker}: {e}")
        return None
