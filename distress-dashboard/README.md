# Krishi Bandhu — Finished Live Test Product

This is a self-contained V1 test product for the farmer distress engine.

It uses live:
- Open-Meteo weather
- AGMARKNET 2.0 mandi price/arrival data

It stores normalized responses in SQLite so repeated dashboard requests do not repeatedly hit upstream APIs.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Open:
http://127.0.0.1:8000

API docs:
http://127.0.0.1:8000/docs

## Live test request

POST `/distress/predict`

```json
{
  "farmer_id": "F001",
  "location": {
    "state": "Odisha",
    "district": "Bhubaneswar",
    "latitude": 20.2961,
    "longitude": 85.8245
  },
  "crop": {
    "name": "rice",
    "area_acres": 2.5
  },
  "market": {
    "name": "Bhubaneswar"
  },
  "loans": [
    {
      "loan_id": "L001",
      "amount": 100000,
      "outstanding_amount": 40000,
      "due_date": "2026-09-01",
      "status": "active"
    }
  ]
}
```

## Data strategy

Weather:
- one live forecast call combines recent 30-day weather and 7-day forecast
- one historical baseline call is cached by location/month
- no API key is required for normal Open-Meteo public usage

Market:
- AGMARKNET filters are cached
- current month plus two previous months are cached
- current market price is taken from the latest matching observation
- historical reference is the median modal price from the previous cached months
- if a selected market has no record, the system falls back to the latest state-wide Paddy price and explicitly reports the fallback

SQLite database:
`data/krishi_bandhu.db`

The system is designed so API calls are made on cache misses, not on every dashboard render.

## Important limitation

AGMARKNET coverage is not guaranteed to be complete for every crop/market/date. The response includes data-quality/fallback information. A score should never be interpreted as ground truth; it is a decision-support risk indicator.
