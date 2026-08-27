import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

BASE_URL = "https://api.weatherapi.com/v1/forecast.json"


def get_weather_forecast(latitude, longitude, days=2):
    params = {
        "key": API_KEY,
        "q": f"{latitude},{longitude}",
        "days": days,
        "aqi": "no",
        "alerts": "yes"
    }

    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()

    data = response.json()
    
    useful_data = []

    for index, forecast in enumerate(data["forecast"]["forecastday"]):

        day = forecast["day"]
        astro = forecast["astro"]

        useful_data.append({
            "date": forecast["date"],

            "current_temp_c": data["current"]["temp_c"] if index == 0 else None,
            "feels_like_c": data["current"]["feelslike_c"] if index == 0 else None,
            "updated_at": data["current"]["last_updated"] if index == 0 else None,

            "max_temp_c": day["maxtemp_c"],
            "min_temp_c": day["mintemp_c"],
            "avg_temp_c": day["avgtemp_c"],

            "max_wind_kph": day["maxwind_kph"],
            "humidity": day["avghumidity"],

            "chance_of_rain": day["daily_chance_of_rain"],

            "chance_of_snow": day["daily_chance_of_snow"],

            "condition": day["condition"]["text"],

            "sunrise": astro["sunrise"],
            "sunset": astro["sunset"]
        })

    return useful_data



if __name__ == "__main__":

    latitude = 22.5726
    longitude = 88.3639

    weather = get_weather_forecast(latitude, longitude)

    # print(weather)

    print(json.dumps(weather, indent=4, default = str))