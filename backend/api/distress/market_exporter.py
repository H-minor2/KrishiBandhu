from datetime import date
from .market import _state_id, _commodity_id, _month_data, _flatten

def get_all_market_prices(state: str, crop: str):
    state_id = _state_id(state)
    if state_id is None:
        return {"error": f"State '{state}' not found in AGMARKNET", "data": []}

    commodity_id, commodity_name = _commodity_id(crop)
    if commodity_id is None:
        return {"error": f"Crop '{crop}' not found in AGMARKNET", "data": []}

    today = date.today()
    current_year, current_month = today.year, today.month

    try:
        current_raw = _month_data(
            state_id, commodity_id, current_year, current_month
        )
        current_records = _flatten(
            current_raw, state, commodity_name, commodity_id,
            current_year, current_month
        )
    except Exception as e:
        return {"error": str(e), "data": []}
    
    # We only want the latest price for each distinct market
    sorted_records = sorted(current_records, key=lambda x: x["arrival_date"], reverse=True)
    latest_by_market = {}
    for r in sorted_records:
        m = r["market"]
        if m not in latest_by_market:
            latest_by_market[m] = r
            
    # Sort the resulting markets by modal_price descending
    result = list(latest_by_market.values())
    result.sort(key=lambda x: x.get("modal_price", 0), reverse=True)
    
    return {"error": None, "data": result}
