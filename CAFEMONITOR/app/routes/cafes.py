from fastapi import APIRouter

from app.models.request_models import CafeSearchRequest
from app.models.response_models import CafeResponse
from app.services.recommendation import get_recommendations

router = APIRouter()


@router.post("/search", response_model=list[CafeResponse])
def search_cafes(request: CafeSearchRequest):
    return get_recommendations(request.city)