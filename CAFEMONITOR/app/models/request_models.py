
from pydantic import BaseModel

class CafeSearchRequest(BaseModel):
    text_query: str          
    latitude: float
    longitude: float
    radius: float = 5000.0    # meters, default 5km 
    budget: str | None = None
    purpose: str | None = None
    wifi_required: bool = False