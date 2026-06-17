import requests

from app.config.settings import settings


def get_cafes(city: str):
    url = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": (
            "places.displayName,places.formattedAddress,places.rating,"
            "places.priceLevel"
        ),
    }

    payload = {
        "textQuery": f"cafes in {city}",
        "pageSize": 5,
    }

    response = requests.post(url, json=payload, headers=headers, timeout=15)
    response.raise_for_status()

    data = response.json()
    print(data)

    return data.get("places", [])