
from datetime import date, timedelta
import statistics
import requests

from .config import WEATHER_BASELINE_YEARS, WEATHER_FORECAST_DAYS, WEATHER_RECENT_DAYS
from .db import get_cache, set_cache

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

def _safe_float(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default

def _forecast(lat, lon):
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "precipitation_sum,temperature_2m_max,weather_code",
        "past_days": WEATHER_RECENT_DAYS,
        "forecast_days": WEATHER_FORECAST_DAYS,
        "timezone": "auto",
        "precipitation_unit": "mm",
        "temperature_unit": "celsius",
    }
    r = requests.get(FORECAST_URL, params=params, timeout=20)
    r.raise_for_status()
    return r.json()

def _historical_baseline(lat, lon):
    today = date.today()
    start = today - timedelta(days=WEATHER_RECENT_DAYS)
    archive_start = start.replace(year=start.year - WEATHER_BASELINE_YEARS)
    archive_end = today - timedelta(days=1)

    key = f"weather-baseline:{round(lat,3)}:{round(lon,3)}:{today.month}:{today.day}:{WEATHER_RECENT_DAYS}:{WEATHER_BASELINE_YEARS}"
    cached = get_cache(key, 30 * 24 * 3600)
    if cached is not None:
        return cached

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": archive_start.isoformat(),
        "end_date": archive_end.isoformat(),
        "daily": "precipitation_sum,temperature_2m_max",
        "timezone": "auto",
        "precipitation_unit": "mm",
        "temperature_unit": "celsius",
    }
    r = requests.get(ARCHIVE_URL, params=params, timeout=30)
    r.raise_for_status()
    raw = r.json()

    dates = raw.get("daily", {}).get("time", [])
    rain = raw.get("daily", {}).get("precipitation_sum", [])
    temps = raw.get("daily", {}).get("temperature_2m_max", [])

    target_start = start.month * 100 + start.day
    target_end = (today - timedelta(days=1)).month * 100 + (today - timedelta(days=1)).day

    yearly = {}
    for d, p, t in zip(dates, rain, temps):
        try:
            dt = date.fromisoformat(d)
        except ValueError:
            continue
        key_num = dt.month * 100 + dt.day
        if target_start <= target_end:
            inside = target_start <= key_num <= target_end
        else:
            inside = key_num >= target_start or key_num <= target_end
        if inside:
            yearly.setdefault(dt.year, {"rain": [], "temp": []})
            if p is not None:
                yearly[dt.year]["rain"].append(_safe_float(p))
            if t is not None:
                yearly[dt.year]["temp"].append(_safe_float(t))

    rainfall_totals = [sum(v["rain"]) for v in yearly.values() if v["rain"]]
    temp_means = [
        statistics.mean(v["temp"]) for v in yearly.values() if v["temp"]
    ]

    baseline = {
        "rainfall_mm": statistics.mean(rainfall_totals) if rainfall_totals else 0.0,
        "temperature_c": statistics.mean(temp_means) if temp_means else 0.0,
        "years_used": len(rainfall_totals),
    }
    set_cache(key, baseline)
    return baseline

def _weather_score(forecast, baseline):
    daily = forecast.get("daily", {})
    times = daily.get("time", [])
    rain = daily.get("precipitation_sum", [])
    temps = daily.get("temperature_2m_max", [])
    codes = daily.get("weather_code", [])

    today = date.today().isoformat()
    recent_indices = [i for i, d in enumerate(times) if d < today]
    forecast_indices = [i for i, d in enumerate(times) if d >= today]

    recent_rain = sum(
        _safe_float(rain[i]) for i in recent_indices[-WEATHER_RECENT_DAYS:]
    )
    baseline_rain = max(_safe_float(baseline.get("rainfall_mm")), 0.1)

    if recent_rain < baseline_rain:
        deficit_pct = (baseline_rain - recent_rain) / baseline_rain * 100
        deficit_score = min(100.0, deficit_pct)
    else:
        deficit_pct = 0.0
        deficit_score = 0.0

    excess_ratio = recent_rain / baseline_rain
    if excess_ratio <= 1.5:
        excess_score = 0.0
    else:
        excess_score = min(100.0, ((excess_ratio - 1.5) / 0.5) * 100)

    rainfall_score = max(deficit_score, excess_score)

    dry_days = 0
    for i in forecast_indices:
        if _safe_float(rain[i]) < 2.0:
            dry_days += 1
        else:
            break
    dry_spell_score = min(100.0, dry_days / 7 * 100)

    forecast_temps = [
        _safe_float(temps[i]) for i in forecast_indices
        if i < len(temps) and temps[i] is not None
    ]
    heat_score = (
        sum(t >= 38 for t in forecast_temps) / len(forecast_temps) * 100
        if forecast_temps else 0.0
    )

    severe_codes = []
    for i in forecast_indices:
        if i < len(codes) and codes[i] is not None:
            code = int(codes[i])
            if code >= 95 or code in {65, 67, 75, 82}:
                severe_codes.append(code)
    alert_score = 100.0 if severe_codes else 0.0

    score = round(
        max(
            0.0,
            min(
                100.0,
                0.45 * rainfall_score
                + 0.25 * dry_spell_score
                + 0.20 * heat_score
                + 0.10 * alert_score,
            ),
        ),
        2,
    )

    quality = "GOOD" if baseline.get("years_used", 0) >= 3 else "LIMITED"

    explanation = (
        f"Recent {WEATHER_RECENT_DAYS}-day rainfall is {recent_rain:.1f} mm "
        f"versus a {baseline.get('years_used', 0)}-year seasonal reference "
        f"of {baseline_rain:.1f} mm. Deficit risk {deficit_score:.1f}/100; "
        f"excess-rain risk {excess_score:.1f}/100. "
        f"Forecast dry-spell risk {dry_spell_score:.1f}/100; "
        f"heat risk {heat_score:.1f}/100; severe-weather signal "
        f"{alert_score:.1f}/100."
    )

    return score, explanation, quality, {
        "recent_rainfall_mm": round(recent_rain, 2),
        "historical_reference_mm": round(baseline_rain, 2),
        "deficit_pct": round(deficit_pct, 2),
        "excess_ratio": round(excess_ratio, 2),
        "dry_days": dry_days,
        "hot_days": sum(t >= 38 for t in forecast_temps),
        "severe_weather_codes": severe_codes,
        "baseline_years": baseline.get("years_used", 0),
    }

def get_weather(lat, lon):
    key = f"weather-live:{round(lat,3)}:{round(lon,3)}:{WEATHER_RECENT_DAYS}:{WEATHER_FORECAST_DAYS}"
    cached = get_cache(key, 3 * 3600)
    if cached is not None:
        return cached

    forecast = _forecast(lat, lon)
    baseline = _historical_baseline(lat, lon)
    score, explanation, quality, data = _weather_score(forecast, baseline)

    result = {
        "score": score,
        "explanation": explanation,
        "data_quality": quality,
        "data": data,
        "source": "open-meteo",
    }
    set_cache(key, result)
    return result
