from fastapi import APIRouter

from app.models.request_models import CafeAddRequest, CafeSearchRequest, SpecifiedPlaceRequest, VibeSearchRequest
from app.models.response_models import CafeAddResponse, CafeBusynessResponse, CafeResponse
from app.services.busyness import get_forecast, get_live_busyness, simplify_live_busyness
from app.services.recommendation import get_recommendations, get_recommendations_by_type, get_recommendations_by_vibe

router = APIRouter()

@router.post("/search", response_model=list[CafeResponse])
def search_cafes(request: CafeSearchRequest):
    return get_recommendations(
        text_query=request.text_query,
        lat=request.latitude,
        lng=request.longitude,
        radius=request.radius,
    )

@router.post("/searchType", response_model=list[CafeResponse])
def search_cafes_by_type(request: SpecifiedPlaceRequest):
    return get_recommendations_by_type(
        lat=request.latitude,
        lng=request.longitude,
        radius=request.radius,
        place_type=request.place_type,
    )

@router.post("/vibesearch", response_model=list[CafeResponse])
def search_cafes_by_vibe(request: VibeSearchRequest):
    return get_recommendations_by_vibe(
        lat=request.latitude,
        lng=request.longitude,
        radius=request.radius,
        user_query=request.user_query,
    )


@router.post("/{cafe_id}/add", response_model=CafeAddResponse)
def add_cafe_for_tracking(cafe_id: str, request: CafeAddRequest):
    venue_id = get_forecast(request.name, request.address)
    cafe_payload = request.model_dump()
    cafe_payload["id"] = cafe_id

    if venue_id:
        cafe_payload["venue_id"] = venue_id

    return CafeAddResponse(cafe_id=cafe_id, venue_id=venue_id, cafe=cafe_payload)


@router.get("/busyness/{venue_id}", response_model=CafeBusynessResponse)
def get_cafe_busyness(venue_id: str):
    raw_live = get_live_busyness(venue_id)

    if not isinstance(raw_live, dict):
        return CafeBusynessResponse(
            venue_id=venue_id,
            busyness="Unknown",
            busyness_percent=None,
            busyness_description="unknown",
        )

    simplified = simplify_live_busyness(raw_live)
    return CafeBusynessResponse(venue_id=venue_id, **simplified)