from app.models.response_models import CafeResponse
from app.services.google_places import get_cafes, get_places_by_type, get_nearby_places
from app.services.semantic_search import semantic_search

from app.config.settings import settings

#TO ADD function which gets nearby eateries based on radius
#for each place, embed its review summary and make a dict of placeid: embedding
#embed user query and find most similar with cosine similairity
#return the top 5 places with their search data and photos

def get_recommendations_by_vibe(lat: float, lng: float, radius: float = 5000.0, user_query: str = ''):
    places = get_nearby_places(lat=lat, lng=lng, radius=radius)

    if not user_query.strip() or not places:
        return create_responses(places[:5], lat, lng)

    place_summaries = {}

    for place in places:
        summary_parts = [place.get("reviewSummary", {}).get("text", {}).get("text", ""), place.get("editorialSummary", {}).get("text", "")]
        overall_summary = " ".join(part for part in summary_parts if part).strip()
        place_summaries[place.get("id", "")] = overall_summary

    top_places = semantic_search(user_query, place_summaries, top_k=5)
    top_place_ids = [place_id for place_id, _ in top_places]
    place_lookup = {place.get("id", ""): place for place in places if place.get("id")}
    ranked_places = [place_lookup[place_id] for place_id in top_place_ids if place_id in place_lookup]

    return create_responses(ranked_places, lat, lng)

def get_recommendations_by_type(lat: float, lng: float, radius: float = 5000.0, place_type: str = ''):
    places = get_places_by_type(lat=lat, lng=lng, radius=radius, place_type=place_type)
    return create_responses(places[:5], lat, lng)


def get_recommendations(text_query: str, lat: float, lng: float, radius: float = 5000.0, place_type: str = ''):
    places = get_cafes(text_query=text_query, lat=lat, lng=lng, radius=radius, place_type=place_type)

    eatery_types = {
        "restaurant", "cafe", "bar", "bakery", "fast_food_restaurant",
        "coffee_shop", "food_court", "meal_takeaway", "pub"
    }

    eateries = [
        place for place in places
        if any(t in eatery_types for t in place.get("types", []))
    ]

    return create_responses(eateries[:5], lat, lng)
    


def create_responses(places: list, lat: float, lng: float) -> list:

    recommendations = []

    for place in places[:5]:
        display_name = place.get("displayName", {})
        name = display_name.get("text", "Unknown")

        # Use only the photos returned by the search response.
        photos = place.get("photos", [])

        fallback_images = [
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
        ]

        if photos:
            photo_urls = [
                f"https://places.googleapis.com/v1/{photo['name']}/media"
                f"?maxWidthPx=600&key={settings.GOOGLE_PLACES_API_KEY}"
                for photo in photos
            ]
        else:
            place_hash = sum(ord(c) for c in (place.get("id", "") + name))
            fallback_idx = place_hash % len(fallback_images)
            photo_urls = [fallback_images[fallback_idx]]

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

        recommendations.append(
            CafeResponse(
                id=place.get("id", ""),
                name=name,
                address=place.get("formattedAddress", "Unknown"),
                distance_from_user=None,
                rating=place.get("rating", 0.0),
                rating_count=place.get("userRatingCount", 0),
                busyness="Unknown",
                price_range=price_range,
                maps_uri=place.get("googleMapsUri", ""),
                website_uri=place.get("websiteUri"),
                editorial_summary=(
                    place.get("editorialSummary", {}).get("text")
                    or place.get("reviewSummary", {}).get("text", {}).get("text")
                ),
                photos=photo_urls,
                opening_hours=opening_hours,
                latitude=lat_location,
                longitude=lng_location,
            )
        )

    return recommendations


     