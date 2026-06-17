from pydantic import BaseModel

class CafeResponse(BaseModel):
    name: str
    address: str
    rating: float
    busyness: str
    price_level: str