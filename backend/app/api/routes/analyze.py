from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, DebateResponse
from app.agents.debate_engine import MultiAgentDebateEngine

router = APIRouter(prefix="/api/analyze", tags=["analyze"])

@router.post("", response_model=DebateResponse)
async def analyze_stock(request: AnalyzeRequest):
    """Trigger multi-agent debate for a given stock and mode."""
    try:
        response = await MultiAgentDebateEngine.run_debate(request.ticker, request.mode)
        return response
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debate engine error: {str(e)}")
