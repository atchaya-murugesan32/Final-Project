
from pydantic import BaseModel

class CafeSearchRequest(BaseModel):
    text_query: str          
    latitude: float
    longitude: float
    radius: float = 5000.0    # meters, default 5km 

class ChatRequest(BaseModel):
    message: str