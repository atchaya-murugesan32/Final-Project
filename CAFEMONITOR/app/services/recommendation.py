from app.models.response_models import CafeResponse
from app.services.google_places import get_cafes


def get_recommendations(city: str):
    places = get_cafes(city)

    recommendations = []

    for place in places[:5]:
        display_name = place.get("displayName", {})
        name = display_name.get("text", "Unknown")

        recommendations.append(
            CafeResponse(
                name=name,
                address=place.get("formattedAddress", "Unknown"),
                rating=place.get("rating", 0.0),
                busyness="Unknown",
                price_level=str(place.get("priceLevel", "N/A")),
            )
        )

    return recommendations