
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import APP_NAME
from .db import clear_cache, init_db
from .models import DistressRequest, DistressResponse
from .services import build_distress_result
from .market_exporter import get_all_market_prices

app = FastAPI(
    title=APP_NAME,
    description="Live farmer distress decision-support API using Open-Meteo and AGMARKNET.",
    version="2.0.0",
)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return FileResponse("static/index.html")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "weather_source": "open-meteo",
        "market_source": "agmarknet",
        "version": "2.0.0-live",
    }


@app.post("/admin/cache/clear")
def cache_clear():
    clear_cache()
    return {"status": "cache_cleared"}


@app.post("/distress/predict", response_model=DistressResponse)
def predict_distress(request: DistressRequest):
    try:
        return build_distress_result(request)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Upstream data provider failure: {exc}",
        ) from exc


@app.get("/market/prices")
def market_prices(state: str, commodity: str):
    result = get_all_market_prices(state, commodity)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]
