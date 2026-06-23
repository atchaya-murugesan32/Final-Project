import requests

from app.config.settings import settings


def get_cafes(text_query: str, lat: float, lng: float, radius: float = 5000.0):
    url = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": (
            "places.id,"
            "places.displayName,"
            "places.formattedAddress,"
            "places.googleMapsUri,"
            "places.photos,"
            "places.location,"
            "places.regularOpeningHours,"
            "places.rating,"
            "places.userRatingCount,"
            "places.priceRange,"
            "places.websiteUri"
        ),
    }

    payload = {
        "textQuery": text_query,
        "pageSize": 5,
        "locationBias": {
            "circle": {
                "center": {
                    "latitude": lat,
                    "longitude": lng,
                },
                "radius": radius,
            }
        },
    }

    response = requests.post(url, json=payload, headers=headers, timeout=15)
    response.raise_for_status()

    data = response.json()
    return data.get("places", [])


def get_place_details(place_id: str):
    url = f"https://places.googleapis.com/v1/places/{place_id}"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "id,photos",
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching place details for {place_id}: {e}")
        return {}