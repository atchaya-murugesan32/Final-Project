import requests

from app.config.settings import settings


def get_busyness(cafe_name: str, city: str):

    url = "https://besttime.app/api/v1/forecasts/live"

    payload = {
        "api_key_private": settings.BESTTIME_API_KEY,
        "venue_name": cafe_name,
        "venue_address": city
    }

    response = requests.post(url, json=payload)

    data = response.json()

    print(data)

    if "analysis" in data:
        score = data["analysis"].get("venue_live_busyness", 0)

        if score >= 70:
            return "Busy"

        elif score >= 40:
            return "Moderate"

        return "Free"

    return "Unknown"