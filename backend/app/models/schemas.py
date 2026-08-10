from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TradingMode(str, Enum):
    INTRADAY = "intraday"
    LONG_TERM = "long-term"

class SignalType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

class StockQuote(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    change_percent: float
    high: float
    low: float
    open: float
    volume: int
    market_cap: Optional[str] = None
    pe_ratio: Optional[float] = None
    day_range: Optional[str] = None

class CandleData(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class TechnicalIndicators(BaseModel):
    rsi: float
    macd: Dict[str, float]
    bollinger: Dict[str, float]
    ema_20: float
    ema_50: float
    vwap: Optional[float] = None
    trend: str

class AgentOpinion(BaseModel):
    agent_id: str
    agent_name: str
    role: str
    avatar: str
    signal: SignalType
    confidence: int = Field(..., ge=0, le=100)
    key_points: List[str]
    technical_targets: Optional[Dict[str, float]] = None
    full_argument: str

class DebateVerdict(BaseModel):
    ticker: str
    mode: TradingMode
    verdict: SignalType
    confidence: int
    consensus_score: float
    target_price: float
    stop_loss: float
    horizon: str
    summary: str
    bull_case: str
    bear_case: str

class DebateResponse(BaseModel):
    ticker: str
    mode: TradingMode
    timestamp: str
    opinions: List[AgentOpinion]
    verdict: DebateVerdict

class AnalyzeRequest(BaseModel):
    ticker: str
    mode: TradingMode = TradingMode.INTRADAY
