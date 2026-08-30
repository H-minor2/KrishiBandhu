
from datetime import date
import calendar
import statistics
import requests

from .config import CACHE_TTL_SECONDS, MARKET_HISTORY_MONTHS
from .db import get_cache, set_cache

BASE_URL = "https://api.agmarknet.gov.in/v1"
HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://agmarknet.gov.in",
    "Referer": "https://agmarknet.gov.in/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/135.0.0.0 Safari/537.36"
    ),
}

ALIASES = {
    "rice": "Paddy(Common)",
    "paddy": "Paddy(Common)",
    "paddy common": "Paddy(Common)",
}

def _get(endpoint, params=None):
    r = requests.get(
        f"{BASE_URL}/{endpoint.lstrip('/')}",
        headers=HEADERS,
        params=params,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()

def _month_shift(year, month, delta):
    index = year * 12 + month - 1 + delta
    return index // 12, index % 12 + 1

def _states():
    cached = get_cache("agmarknet:states", 7 * 24 * 3600)
    if cached is not None:
        return cached
    all_states = []
    for page in range(1, 10):
        data = _get("/location/state", {"page": page})
        rows = data.get("states", [])
        if not rows:
            break
        all_states.extend(rows)
        if len(rows) < 10:
            break
    set_cache("agmarknet:states", all_states)
    return all_states

def _state_id(name):
    for state in _states():
        if str(state.get("state_name", "")).strip().lower() == name.strip().lower():
            return state.get("id")
    return None

def _commodity_id(name):
    filters = get_cache("agmarknet:filters", 7 * 24 * 3600)
    if filters is None:
        filters = _get("/daily-price-arrival/filters")
        set_cache("agmarknet:filters", filters)

    target = ALIASES.get(name.strip().lower(), name.strip()).lower()
    for item in filters.get("data", {}).get("cmdt_data", []):
        if str(item.get("cmdt_name", "")).strip().lower() == target:
            return item.get("cmdt_id"), item.get("cmdt_name")
    return None, None

def _month_data(state_id, commodity_id, year, month):
    key = f"agmarknet:month:{state_id}:{commodity_id}:{year}:{month}"
    cached = get_cache(key, CACHE_TTL_SECONDS)
    if cached is not None:
        return cached

    data = _get(
        "/prices-and-arrivals/date-wise/specific-commodity",
        {
            "year": year,
            "month": month,
            "stateId": state_id,
            "commodityId": commodity_id,
            "includeExcel": "false",
        },
    )
    set_cache(key, data)
    return data

def _flatten(raw, state, commodity, commodity_id, year, month):
    records = []
    for market in raw.get("markets", []):
        market_name = market.get("marketName", "")
        for day in market.get("dates", []):
            d = day.get("arrivalDate", "")
            for row in day.get("data", []):
                try:
                    modal = float(row.get("modalPrice"))
                except (TypeError, ValueError):
                    modal = None
                try:
                    arrivals = float(row.get("arrivals"))
                except (TypeError, ValueError):
                    arrivals = None
                if modal is None:
                    continue
                records.append({
                    "arrival_date": d,
                    "state": state,
                    "market": market_name,
                    "commodity": commodity,
                    "commodity_id": commodity_id,
                    "variety": row.get("variety", ""),
                    "arrivals_mt": arrivals,
                    "minimum_price": row.get("minimumPrice"),
                    "maximum_price": row.get("maximumPrice"),
                    "modal_price": modal,
                    "year": year,
                    "month": month,
                })
    return records

def _latest(records):
    if not records:
        return None
    return sorted(records, key=lambda x: x["arrival_date"])[-1]

def get_market(state, crop, market_name=""):
    state_id = _state_id(state)
    if state_id is None:
        return {
            "score": 50.0,
            "explanation": f"AGMARKNET has no matching state '{state}'.",
            "data_quality": "UNAVAILABLE",
            "data": {},
            "source": "agmarknet",
        }

    commodity_id, commodity_name = _commodity_id(crop)
    if commodity_id is None:
        return {
            "score": 50.0,
            "explanation": f"AGMARKNET has no exact commodity mapping for '{crop}'.",
            "data_quality": "UNAVAILABLE",
            "data": {},
            "source": "agmarknet",
        }

    today = date.today()
    current_year, current_month = today.year, today.month

    current_records = []
    try:
        current_raw = _month_data(
            state_id, commodity_id, current_year, current_month
        )
        current_records = _flatten(
            current_raw, state, commodity_name, commodity_id,
            current_year, current_month
        )
    except requests.exceptions.RequestException as e:
        pass

    history_records = []
    for offset in range(1, MARKET_HISTORY_MONTHS + 1):
        y, m = _month_shift(current_year, current_month, -offset)
        try:
            raw = _month_data(state_id, commodity_id, y, m)
            history_records.extend(
                _flatten(raw, state, commodity_name, commodity_id, y, m)
            )
        except requests.exceptions.RequestException:
            pass

    selected = [
        r for r in current_records
        if market_name and market_name.strip().lower() in r["market"].strip().lower()
    ]

    fallback_used = False
    if selected:
        latest = _latest(selected)
        scope = selected
    else:
        fallback_used = True
        latest = _latest(current_records)
        scope = current_records

    if latest is None:
        return {
            "score": 50.0,
            "explanation": (
                f"No current AGMARKNET observation was found for "
                f"{commodity_name} in {state}."
            ),
            "data_quality": "UNAVAILABLE",
            "data": {
                "commodity": commodity_name,
                "market_requested": market_name,
            },
            "source": "agmarknet",
        }

    historical_prices = [
        r["modal_price"]
        for r in history_records
        if r["modal_price"] is not None
    ]

    historical_arrivals = [
        r["arrivals_mt"]
        for r in history_records
        if r["arrivals_mt"] is not None
    ]

    if historical_prices:
        reference_price = statistics.median(historical_prices)
    else:
        reference_price = latest["modal_price"]

    if reference_price <= 0:
        price_decline_pct = 0.0
    else:
        price_decline_pct = max(
            0.0,
            (reference_price - latest["modal_price"])
            / reference_price
            * 100,
        )

    price_score = min(100.0, price_decline_pct / 40.0 * 100.0)

    current_arrivals = latest.get("arrivals_mt")
    arrival_score = 0.0
    if current_arrivals is not None and historical_arrivals:
        median_arrival = statistics.median(historical_arrivals)
        if median_arrival > 0 and current_arrivals > median_arrival:
            arrival_ratio = current_arrivals / median_arrival
            arrival_score = min(100.0, max(0.0, (arrival_ratio - 1) / 1.0 * 100))

    volatility_score = 0.0
    if len(historical_prices) >= 3:
        mean_price = statistics.mean(historical_prices)
        if mean_price > 0:
            cv = statistics.pstdev(historical_prices) / mean_price
            volatility_score = min(100.0, cv / 0.20 * 100.0)

    score = round(
        min(
            100.0,
            max(
                0.0,
                0.70 * price_score
                + 0.20 * arrival_score
                + 0.10 * volatility_score,
            ),
        ),
        2,
    )

    quality = "GOOD"
    if len(historical_prices) < 10:
        quality = "LIMITED"
    if fallback_used:
        quality = "FALLBACK"

    explanation = (
        f"Latest {commodity_name} modal price is ₹{latest['modal_price']:.0f} "
        f"on {latest['arrival_date']}. Historical reference is "
        f"₹{reference_price:.0f}; price decline is {price_decline_pct:.1f}%. "
        f"Price-pressure risk {price_score:.1f}/100, arrival-pressure risk "
        f"{arrival_score:.1f}/100, volatility risk {volatility_score:.1f}/100."
    )
    if fallback_used:
        explanation += (
            f" The requested market '{market_name}' had no current matching "
            f"observation, so the latest available state-level market "
            f"observation was used."
        )

    return {
        "score": score,
        "explanation": explanation,
        "data_quality": quality,
        "data": {
            "commodity": commodity_name,
            "commodity_id": commodity_id,
            "market_requested": market_name,
            "market_used": latest["market"],
            "fallback_used": fallback_used,
            "arrival_date": latest["arrival_date"],
            "current_modal_price": latest["modal_price"],
            "historical_reference_price": round(reference_price, 2),
            "price_decline_pct": round(price_decline_pct, 2),
            "current_arrivals_mt": latest.get("arrivals_mt"),
            "historical_observations": len(historical_prices),
            "historical_months_requested": MARKET_HISTORY_MONTHS,
        },
        "source": "agmarknet",
    }
