from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.cafes import router as cafes_router
from app.auth.auth_routes import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reservations import router as reservations_router
from app.routes.ai import router as ai_router
from app.routes.favorites import router as favorites_router

app = FastAPI(
    title="CafeMonitor API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cafes_router, prefix="/cafes", tags=["cafes"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(reservations_router, prefix="/reservations", tags=["reservations"])
app.include_router(ai_router, prefix="/ai", tags=["ai"])
app.include_router(favorites_router, prefix="/favorites", tags=["favorites"])

@app.get("/health")
def health_check():
    return {"status": "ok"}