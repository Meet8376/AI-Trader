from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.models.schemas import TradingMode
from app.services.stock_service import StockService

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("")
def get_top_picks(mode: TradingMode = Query(TradingMode.INTRADAY)):
    """Get top AI recommended stock picks for selected mode."""
    stocks = StockService.get_all_stocks()
    
    # Sort & rank based on simulated AI consensus score
    picks = []
    for idx, s in enumerate(stocks[:5]):
        if mode == TradingMode.INTRADAY:
            consensus = round(9.2 - idx * 0.4, 1)
            signal = "STRONG BUY" if idx < 2 else "BUY"
            rationale = f"High intraday momentum with VWAP breakout at ₹{s.price}. Target: ₹{round(s.price * 1.03, 2)}"
        else:
            consensus = round(9.5 - idx * 0.3, 1)
            signal = "STRONG ACCUMULATE" if idx < 3 else "ACCUMULATE"
            rationale = f"Strong balance sheet ({s.market_cap}) and attractive P/E ratio ({s.pe_ratio or 20.0}). Target: ₹{round(s.price * 1.15, 2)}"

        picks.append({
            "rank": idx + 1,
            "ticker": s.ticker,
            "name": s.name,
            "price": s.price,
            "change": s.change,
            "change_percent": s.change_percent,
            "consensus_score": consensus,
            "signal": signal,
            "rationale": rationale,
            "target_price": round(s.price * (1.035 if mode == TradingMode.INTRADAY else 1.15), 2),
            "stop_loss": round(s.price * (0.985 if mode == TradingMode.INTRADAY else 0.94), 2)
        })
        
    return {
        "mode": mode.value,
        "updated_at": "Just now",
        "top_picks": picks
    }
