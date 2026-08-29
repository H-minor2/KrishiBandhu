
from datetime import datetime, timezone

from .loan import get_loan
from .market import get_market
from .models import DistressRequest
from .weather import get_weather

WEIGHTS = {
    "weather": 0.40,
    "market": 0.30,
    "loan": 0.30,
}

def risk_level(score):
    if score < 30:
        return "LOW"
    if score < 60:
        return "MODERATE"
    if score < 80:
        return "HIGH"
    return "CRITICAL"

def build_distress_result(req: DistressRequest):
    weather = get_weather(
        req.location.latitude,
        req.location.longitude,
    )

    market = get_market(
        req.location.state,
        req.crop.name,
        req.market.name,
    )

    loan = get_loan(req.loans, req.annual_income)

    components = {}
    for name, result in [
        ("weather", weather),
        ("market", market),
        ("loan", loan),
    ]:
        weight = WEIGHTS[name]
        contribution = round(result["score"] * weight, 2)
        components[name] = {
            "score": result["score"],
            "weight": weight,
            "contribution": contribution,
            "explanation": result["explanation"],
            "data_quality": result.get("data_quality", "GOOD"),
            "data": result.get("data", {}),
        }

    final_score = round(
        sum(c["contribution"] for c in components.values()),
        2,
    )

    # Extreme Condition Overrides
    # If DTI is > 100%, it's a catastrophic debt trap; force score to CRITICAL.
    dti = components.get("loan", {}).get("data", {}).get("dti_ratio", 0)
    if dti > 1.0:
        final_score = max(final_score, 85.0)
    # If DTI is > 60%, force score to HIGH.
    elif dti > 0.60:
        final_score = max(final_score, 65.0)

    reasons = [
        components["weather"]["explanation"],
        components["market"]["explanation"],
        components["loan"]["explanation"],
    ]

    quality = {
        name: component["data_quality"]
        for name, component in components.items()
    }

    return {
        "farmer_id": req.farmer_id,
        "distress_score": final_score,
        "risk_level": risk_level(final_score),
        "components": components,
        "reasons": reasons,
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "weather_source": "open-meteo",
            "market_source": "agmarknet",
            "market_weight": WEIGHTS["market"],
            "weather_weight": WEIGHTS["weather"],
            "loan_weight": WEIGHTS["loan"],
            "data_quality": quality,
            "version": "2.0.0-live",
        },
    }
