import asyncio
import json
import random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
from app.services.stock_service import StockService, STOCKS_DB
from app.agents.debate_engine import MultiAgentDebateEngine
from app.models.schemas import TradingMode

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial stock list
        stocks = StockService.get_all_stocks()
        await websocket.send_json({
            "type": "initial_quotes",
            "data": [s.model_dump() for s in stocks]
        })

        while True:
            # Receive client messages (e.g. trigger debate or subscribe)
            raw_data = await websocket.receive_text()
            try:
                msg = json.loads(raw_data)
                action = msg.get("action")
                
                if action == "start_debate":
                    ticker = msg.get("ticker", "RELIANCE")
                    mode_str = msg.get("mode", "intraday")
                    mode = TradingMode.INTRADAY if mode_str == "intraday" else TradingMode.LONG_TERM
                    
                    async for event in MultiAgentDebateEngine.stream_debate_events(ticker, mode):
                        await websocket.send_json({"type": "debate_event", "event": event})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": str(e)})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
