from app.models.response_models import CafeResponse
from app.services.google_places import get_cafes
from app.services.distance import calculate_distance

from app.config.settings import settings


def get_recommendations(text_query: str, lat: float, lng: float, radius: float = 5000.0):
    places = get_cafes(text_query=text_query, lat=lat, lng=lng, radius=radius)

    recommendations = []

    for place in places[:5]:
        display_name = place.get("displayName", {})
        name = display_name.get("text", "Unknown")

        # extract photo names and build URLs
        photos = place.get("photos", [])
        photo_urls = [
            f"https://places.googleapis.com/v1/{photo['name']}/media"
            f"?maxWidthPx=600&key={settings.GOOGLE_PLACES_API_KEY}"
            for photo in photos
        ]

        # extract opening hours as a list of strings (e.g. "Monday: 8AM–6PM")
        opening_hours_data = place.get("regularOpeningHours", {})
        opening_hours = opening_hours_data.get("weekdayDescriptions", [])

        # extract price range as a readable string
        price_range_data = place.get("priceRange", {})
        start_price = price_range_data.get("startPrice", {})
        end_price = price_range_data.get("endPrice", {})
        price_range = (
            f"{start_price.get('currencyCode', '')} "
            f"{start_price.get('units', '?')}–{end_price.get('units', '?')}"
            if price_range_data else "N/A"
        )

        location = place.get("location", {})
        lat_location = location.get("latitude", 0.0)
        lng_location = location.get("longitude", 0.0)

        distance_kilometers = calculate_distance(lat, lng, lat_location, lng_location)  # Placeholder for actual user location



        recommendations.append(
            CafeResponse(
                id=place.get("id", ""),
                name=name,
                address=place.get("formattedAddress", "Unknown"),
                distance_from_user=distance_kilometers,
                rating=place.get("rating", 0.0),
                rating_count=place.get("userRatingCount", 0),
                busyness="Unknown",
                price_range=price_range,
                maps_uri=place.get("googleMapsUri", ""),
                website_uri=place.get("websiteUri"),
                photos=photo_urls,
                opening_hours=opening_hours,
            )
        )

    return recommendations