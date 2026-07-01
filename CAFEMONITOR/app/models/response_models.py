from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class CafeResponse(BaseModel):
    id: str
    name: str
    address: str
    distance_from_user: Optional[float] = None
    rating: float
    rating_count: int
    busyness: str
    busyness_percent: Optional[int] = None
    busyness_description: Optional[str] = None
    price_range: str
    maps_uri: str
    website_uri: Optional[str] = None
    editorial_summary: Optional[str] = None
    photos: List[str] = []
    opening_hours: List[str] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CafeAddResponse(BaseModel):
    cafe_id: str
    venue_id: Optional[str] = None
    cafe: Dict[str, Any]


class CafeBusynessResponse(BaseModel):
    venue_id: str
    busyness: str
    busyness_percent: Optional[int] = None
    busyness_description: str