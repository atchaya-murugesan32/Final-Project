from pydantic import BaseModel
from typing import List, Optional

class CafeResponse(BaseModel):
    id: str
    name: str
    address: str
    distance_from_user: Optional[float] = None
    rating: float
    rating_count: int
    busyness: str
    price_range: str
    maps_uri: str
    website_uri: Optional[str] = None
    editorial_summary: Optional[str] = None
    photos: List[str] = []
    opening_hours: List[str] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None