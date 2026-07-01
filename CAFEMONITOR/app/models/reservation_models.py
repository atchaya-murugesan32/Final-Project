from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    cafe_id: str
    cafe_name: str
    reservation_date: str
    reservation_time: str
    num_people: int
    special_request: Optional[str] = None

class ReservationResponse(BaseModel):
    id: int
    user_id: int
    cafe_id: str
    cafe_name: str
    reservation_date: str
    reservation_time: str
    num_people: int
    status: str
    table_number: Optional[str] = None
    special_request: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
