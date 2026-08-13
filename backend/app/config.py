import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI-Trader Engine"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # API Keys (Loaded from .env)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    STOCK_API_KEY: str = os.getenv("STOCK_API_KEY", "")
    STOCK_API_PROVIDER: str = os.getenv("STOCK_API_PROVIDER", "alphavantage")
    
    # Angel One SmartAPI Credentials (Optional)
    ANGEL_ONE_API_KEY: str = os.getenv("ANGEL_ONE_API_KEY", "")
    ANGEL_ONE_CLIENT_CODE: str = os.getenv("ANGEL_ONE_CLIENT_CODE", "")
    ANGEL_ONE_PASSWORD: str = os.getenv("ANGEL_ONE_PASSWORD", "")
    ANGEL_ONE_TOTP_KEY: str = os.getenv("ANGEL_ONE_TOTP_KEY", "")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
