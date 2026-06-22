from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.cafes import router as cafes_router

app = FastAPI(
    title="CafeMonitor API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # tighten to your frontend origin later
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    cafes_router,
    prefix="/cafes",
    tags=["cafes"]
)


@app.get("/health")
def health_check():
    return {"status": "ok"}