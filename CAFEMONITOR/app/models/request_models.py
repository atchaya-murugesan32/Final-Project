from pydantic import BaseModel

class CafeSearchRequest(BaseModel):
    city: str
    budget: str
    purpose: str
    wifi_required: bool = False