from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from .config import APP_NAME
from .db import clear_cache, init_db
from .models import DistressRequest, DistressResponse
from .services import build_distress_result
from .market_exporter import get_all_market_prices

router = APIRouter()


@router.on_event("startup")
def startup():
    init_db()


@router.get("/health")
def health():
    return {
        "status": "ok",
        "weather_source": "open-meteo",
        "market_source": "agmarknet",
        "version": "2.0.0-live",
    }


@router.post("/admin/cache/clear")
def cache_clear():
    clear_cache()
    return {"status": "cache_cleared"}


@router.post("/distress/predict", response_model=DistressResponse)
def predict_distress(request: DistressRequest):
    try:
        return build_distress_result(request)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Upstream data provider failure: {exc}",
        ) from exc


@router.get("/market/prices")
def market_prices(state: str, commodity: str):
    result = get_all_market_prices(state, commodity)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result["data"]
