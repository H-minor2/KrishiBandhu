
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

payload = {
    "farmer_id": "TEST001",
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

response = client.post("/distress/predict", json=payload)
print("STATUS:", response.status_code)
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
assert response.status_code == 200
body = response.json()
assert 0 <= body["distress_score"] <= 100
assert set(body["components"]) == {"weather", "market", "loan"}
print("LIVE SMOKE TEST PASSED")
