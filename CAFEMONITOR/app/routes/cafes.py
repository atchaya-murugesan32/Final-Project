from fastapi import APIRouter

from app.models.request_models import CafeSearchRequest, SpecifiedPlaceRequest, VibeSearchRequest
from app.models.response_models import CafeResponse
from app.services.recommendation import get_recommendations, get_recommendations_by_type, get_recommendations_by_vibe

router = APIRouter()

@router.post("/search", response_model=list[CafeResponse])
def search_cafes(request: CafeSearchRequest):
    return get_recommendations(
        text_query=request.text_query,
        lat=request.latitude,
        lng=request.longitude,
        radius=request.radius,
        place_type=request.place_type,
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