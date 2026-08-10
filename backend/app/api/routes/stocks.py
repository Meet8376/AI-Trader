from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import StockQuote, CandleData
from app.services.stock_service import StockService
from app.services.indicator_service import IndicatorService

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

@router.get("", response_model=List[StockQuote])
def get_stocks():
    """Get real-time quotes for all watchlist stocks."""
    return StockService.get_all_stocks()

@router.get("/{ticker}", response_model=StockQuote)
def get_stock(ticker: str):
    """Get stock details for a single ticker."""
    stock = StockService.get_stock_by_ticker(ticker)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")
    return stock

@router.get("/{ticker}/candles")
def get_stock_candles(
    ticker: str,
    timeframe: str = Query("15m", description="Timeframe: 1m, 5m, 15m, 1h, 1D"),
    count: int = Query(100, ge=10, le=500)
):
    """Get candlestick OHLCV data with pre-calculated technical indicators."""
    stock = StockService.get_stock_by_ticker(ticker)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock {ticker} not found")

    candles = StockService.generate_candles(ticker, timeframe=timeframe, count=count)
    indicators = IndicatorService.calculate_indicators(candles)

    return {
        "ticker": ticker.upper(),
        "timeframe": timeframe,
        "candles": candles,
        "indicators": indicators
    }
