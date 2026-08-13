"""
Angel One SmartAPI Service Adapter for Indian Equity Market (NSE/BSE)
Ready for seamless activation once credentials (API_KEY, CLIENT_CODE, PASSWORD, TOTP_KEY) are placed in .env
"""

import logging
from typing import Dict, Any, Optional, List
from app.config import settings

logger = logging.getLogger(__name__)

# Known SmartAPI Token Mapping for NSE Equities
ANGEL_TOKENS: Dict[str, str] = {
    "RELIANCE": "2885",
    "TCS": "11536",
    "HDFCBANK": "1333",
    "ICICIBANK": "4963",
    "BHARTIARTL": "10604",
    "INFY": "1594",
    "SBIN": "3045",
    "ITC": "1660",
    "HINDUNILVR": "1330",
    "LT": "11483",
    "TATAMOTORS": "3456",
    "M&M": "2031",
    "MARUTI": "10999",
    "BAJAJ-AUTO": "16669",
    "HEROMOTOCO": "1348",
    "EICHERMOT": "910",
    "HCLTECH": "7229",
    "WIPRO": "3787",
    "LTIM": "17818",
    "TECHM": "13538",
    "PERSISTENT": "18365",
    "AXISBANK": "5900",
    "KOTAKBANK": "1922",
    "BAJFINANCE": "317",
    "BAJAJFINSV": "16675",
    "INDUSINDBK": "5258",
    "BANKBARODA": "4668",
    "PNB": "10666",
    "NTPC": "11630",
    "POWERGRID": "14977",
    "ONGC": "2475",
    "BPCL": "526",
    "IOC": "1624",
    "TATAPOWER": "3426",
    "ADANIGREEN": "3563",
    "ADANIENT": "25",
    "ADANIPORTS": "15083",
    "TATASTEEL": "3499",
    "HINDALCO": "1363",
    "JSWSTEEL": "11723",
    "ULTRACEMCO": "11532",
    "GRASIM": "1232",
    "SUNPHARMA": "3351",
    "DRREDDY": "881",
    "CIPLA": "694",
    "DIVISLAB": "10940",
    "APOLLOHOSP": "157",
    "TITAN": "3506",
    "ASIANPAINT": "236",
    "NESTLEIND": "17963",
    "BRITANNIA": "547",
    "TATACONSUM": "3432",
    "DMART": "19704",
    "ZOMATO": "5097"
}

class AngelOneService:
    def __init__(self):
        self.api_key = getattr(settings, "ANGEL_ONE_API_KEY", "")
        self.client_code = getattr(settings, "ANGEL_ONE_CLIENT_CODE", "")
        self.password = getattr(settings, "ANGEL_ONE_PASSWORD", "")
        self.totp_key = getattr(settings, "ANGEL_ONE_TOTP_KEY", "")
        self.smart_api = None
        self.is_connected = False

    def initialize(self) -> bool:
        """Initialize connection to Angel One SmartAPI."""
        if not self.api_key or not self.client_code:
            logger.info("Angel One API credentials not configured yet. Using verified market database.")
            return False

        try:
            from SmartApi import SmartConnect
            import pyotp

            self.smart_api = SmartConnect(api_key=self.api_key)
            if self.totp_key:
                if self.totp_key.isdigit() and len(self.totp_key) == 6:
                    totp = self.totp_key
                else:
                    totp = pyotp.TOTP(self.totp_key).now()
            else:
                totp = ""
            data = self.smart_api.generateSession(self.client_code, self.password, totp)
            
            if data and data.get("status"):
                self.is_connected = True
                logger.info("Successfully connected to Angel One SmartAPI!")
                return True
            else:
                logger.warning(f"Angel One session generation failed: {data.get('message') if data else 'Unknown error'}")
        except ImportError:
            logger.warning("SmartApi package not installed. Run: pip install smartapi-python pyotp")
        except Exception as e:
            logger.error(f"Error initializing Angel One SmartAPI: {e}")
        
        return False

    def get_market_quote(self, symbol: str, exchange: str = "NSE") -> Optional[Dict[str, Any]]:
        """Fetch live market quote for a symbol using Angel One."""
        if not self.is_connected or not self.smart_api:
            return None

        clean_symbol = symbol.upper().replace(".NS", "").replace(".BO", "")
        token = ANGEL_TOKENS.get(clean_symbol, "")

        if not token:
            return None

        try:
            response = self.smart_api.ltpData(exchange, f"{clean_symbol}-EQ", token)
            if response and response.get("status"):
                data = response.get("data", {})
                return {
                    "symbol": clean_symbol,
                    "price": float(data.get("ltp", 0.0)),
                    "open": float(data.get("open", 0.0)),
                    "high": float(data.get("high", 0.0)),
                    "low": float(data.get("low", 0.0)),
                    "close": float(data.get("close", 0.0))
                }
        except Exception as e:
            logger.error(f"Error fetching LTP from Angel One for {symbol}: {e}")

    def get_historical_candles(self, symbol: str, timeframe: str = "15m", count: int = 60, exchange: str = "NSE") -> Optional[List[Dict[str, Any]]]:
        """Fetch historical candle data from Angel One SmartAPI."""
        from datetime import datetime, timedelta
        if not self.is_connected or not self.smart_api:
            return None

        clean_symbol = symbol.upper().replace(".NS", "").replace(".BO", "")
        token = ANGEL_TOKENS.get(clean_symbol, "")
        if not token:
            return None

        tf_map = {
            "1m": "ONE_MINUTE",
            "5m": "FIVE_MINUTE",
            "15m": "FIFTEEN_MINUTE",
            "1h": "ONE_HOUR",
            "1D": "ONE_DAY"
        }
        interval = tf_map.get(timeframe, "FIFTEEN_MINUTE")

        now = datetime.now()
        from_date = (now - timedelta(days=15)).strftime("%Y-%m-%d 09:15")
        to_date = now.strftime("%Y-%m-%d 15:30")

        try:
            params = {
                "exchange": exchange,
                "symboltoken": token,
                "interval": interval,
                "fromdate": from_date,
                "todate": to_date
            }
            res = self.smart_api.getCandleData(params)
            if res and res.get("status") and res.get("data"):
                raw_candles = res["data"]
                candles = []
                for row in raw_candles[-count:]:
                    time_str = str(row[0])[:16].replace("T", " ")
                    candles.append({
                        "time": time_str,
                        "open": float(row[1]),
                        "high": float(row[2]),
                        "low": float(row[3]),
                        "close": float(row[4]),
                        "volume": int(row[5])
                    })
                if candles:
                    return candles
        except Exception as e:
            logger.error(f"Error fetching Angel One candles for {symbol}: {e}")

        return None

# Singleton instance
angel_one_service = AngelOneService()
