
from pydantic import BaseModel

class CafeResponse(BaseModel):
    id: str
    name: str
    address: str
    distance_from_user: float
    rating: float
    rating_count: int
    busyness: str
    price_range: str
    maps_uri: str
    website_uri: str | None = None
    photos: list[str] = []
    opening_hours: list[str] = []
    latitude: float | None = None
    longitude: float | None = None