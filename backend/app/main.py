import asyncio
import os
import logging
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import stocks, analyze, recommendations
from app.api import websocket

logger = logging.getLogger("ai_trader.keepalive")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Real-time Multi-Agent AI Stock Trading Engine"
)

# CORS middleware setup for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(stocks.router)
app.include_router(analyze.router)
app.include_router(recommendations.router)
app.include_router(websocket.router)

from app.services.angel_one_service import angel_one_service

async def keep_alive_task():
    """Background task to self-ping Render URL every 10 minutes to prevent sleep."""
    await asyncio.sleep(15) # Delay initial ping on boot
    render_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("SELF_PING_URL")
    
    if not render_url:
        logger.info("No RENDER_EXTERNAL_URL set. Self-ping keepalive skipped.")
        return

    ping_endpoint = f"{render_url.rstrip('/')}/health"
    logger.info(f"Starting 24/7 Keep-Alive self-ping loop targeting {ping_endpoint}")

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            try:
                res = await client.get(ping_endpoint)
                logger.info(f"Keep-alive ping success: status {res.status_code}")
            except Exception as e:
                logger.warning(f"Keep-alive ping failed: {e}")
            
            # Ping every 10 minutes (600 seconds) - Render sleeps after 15 mins of inactivity
            await asyncio.sleep(600)

@app.on_event("startup")
async def startup_event():
    angel_one_service.initialize()
    # Start self-ping task in background
    asyncio.create_task(keep_alive_task())

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "keepalive": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
