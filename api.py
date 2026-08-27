from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from weather import get_weather_forecast

app = FastAPI(title="Krishi Bandhu Weather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)-


@app.get("/weather")
def weather(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    try:
        forecast = get_weather_forecast(latitude, longitude)
        return {
            "latitude": latitude,
            "longitude": longitude,
            "forecast": forecast,
        }
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Unable to fetch weather data: {error}") from error
