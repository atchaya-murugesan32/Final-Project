import requests

from app.config.settings import settings

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
            "places.websiteUri,"
            "places.reviewSummary,"
            "places.editorialSummary,"
            "places.types"
        ),
    }


# maps the frontend category labels to valid Google Places types
# (see https://developers.google.com/maps/documentation/places/web-service/place-types)
PLACE_TYPE_MAP = {
    "cafes": "cafe",
    "cafe": "cafe",
    "restaurants": "restaurant",
    "restaurant": "restaurant",
    "bars": "bar",
    "bar": "bar",
    "brunch": "brunch_restaurant",
    "study spaces": "library",
    "study space": "library",
}

FOOD_PLACE_TYPES = {
    "cafe",
    "restaurant",
    "bar",
    "brunch_restaurant",
    "library",
}

def get_nearby_places(lat: float, lng: float, radius: float = 5000.0):
    url = "https://places.googleapis.com/v1/places:searchNearby"



    payload = {
        "includedTypes": ["restaurant"],
        "maxResultCount": 10,
        "locationRestriction": {
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

    print(response.status_code)
    print("Response JSON:", response.json())  # this will show Google's actual error message
    response.raise_for_status()

    data = response.json()
    return data.get("places", [])

def get_places_by_type(lat: float, lng: float, radius: float = 5000.0, place_type: str = ''):
    url = "https://places.googleapis.com/v1/places:searchNearby"

    normalized_type = PLACE_TYPE_MAP.get(place_type.strip().lower(), place_type)

    payload = {
        "includedTypes": [normalized_type] if normalized_type else [],
        "maxResultCount": 5,
        "locationRestriction": {
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
    



def get_cafes(text_query: str, lat: float, lng: float, radius: float = 5000.0, place_type: str = ''):
    url = "https://places.googleapis.com/v1/places:searchText"

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
    if place_type:
        payload["textQuery"] = f"{text_query} {place_type}" if text_query else place_type

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
