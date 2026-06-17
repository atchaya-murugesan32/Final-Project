from fastapi import FastAPI
from app.routes.cafes import router as cafes_router

app = FastAPI(
    title="CafeMonitor API",
    version="1.0.0"
)

app.include_router(
    cafes_router,
    prefix="/cafes",
    tags=["cafes"]
)


@app.get("/health")
def health_check():
    return {"status": "ok"}