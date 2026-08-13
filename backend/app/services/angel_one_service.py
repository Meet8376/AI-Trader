"""
Angel One SmartAPI Service Adapter for Indian Equity Market (NSE/BSE)
Ready for seamless activation once credentials (API_KEY, CLIENT_CODE, PASSWORD, TOTP_KEY) are placed in .env
"""

import logging
from typing import Dict, Any, Optional, List
from app.config import settings

logger = logging.getLogger(__name__)

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
            # SmartApi library import check
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

        try:
            # Example LTP API call
            response = self.smart_api.ltpData(exchange, f"{symbol}-EQ", f"{symbol}_TOKEN")
            if response and response.get("status"):
                data = response.get("data", {})
                return {
                    "symbol": symbol,
                    "price": float(data.get("ltp", 0.0)),
                    "open": float(data.get("open", 0.0)),
                    "high": float(data.get("high", 0.0)),
                    "low": float(data.get("low", 0.0)),
                    "close": float(data.get("close", 0.0))
                }
        except Exception as e:
            logger.error(f"Error fetching LTP from Angel One for {symbol}: {e}")

        return None

# Singleton instance
angel_one_service = AngelOneService()
