from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import stocks, analyze, recommendations
from app.api import websocket

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

@app.on_event("startup")
async def startup_event():
    angel_one_service.initialize()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
