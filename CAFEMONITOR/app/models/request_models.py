
from pydantic import BaseModel


class CafeSearchRequest(BaseModel):
    text_query: str
    latitude: float
    longitude: float
    radius: float = 5000.0


class SpecifiedPlaceRequest(BaseModel):
    place_type: str
    latitude: float
    longitude: float
    radius: float = 5000.0


class VibeSearchRequest(BaseModel):
    user_query: str
    latitude: float
    longitude: float
    radius: float = 5000.0


class ChatRequest(BaseModel):
    message: str


class CafeAddRequest(BaseModel):
    name: str
    address: str
    rating: float = 0.0
    rating_count: int = 0
    maps_uri: str = ""
    website_uri: str | None = None
    photo: str | None = None
    latitude: float | None = None
    longitude: float | None = None
