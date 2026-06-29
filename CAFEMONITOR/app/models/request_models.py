
from pydantic import BaseModel


class CafeSearchRequest(BaseModel):
    text_query: str
    latitude: float
    longitude: float
    radius: float = 5000.0
    place_type: str = ''


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
