
import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "Krishi Bandhu Farmer Distress Dashboard")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "21600"))
WEATHER_RECENT_DAYS = int(os.getenv("WEATHER_RECENT_DAYS", "30"))
WEATHER_FORECAST_DAYS = int(os.getenv("WEATHER_FORECAST_DAYS", "7"))
WEATHER_BASELINE_YEARS = int(os.getenv("WEATHER_BASELINE_YEARS", "5"))
MARKET_HISTORY_MONTHS = int(os.getenv("MARKET_HISTORY_MONTHS", "2"))
DATABASE_PATH = os.path.join("data", "krishi_bandhu.db")
