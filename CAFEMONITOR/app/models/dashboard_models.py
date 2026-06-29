from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None

class DashboardStats(BaseModel):
    total_visits: int
    total_reservations: int
    favorite_cafes_count: int
    ai_recommendations_used: int
    reviews_submitted: int
    avg_rating_given: float

class FavoriteCafeCreate(BaseModel):
    cafe_id: str
    cafe_name: str
    rating: Optional[float] = None
    image_url: Optional[str] = None

class FavoriteCafeResponse(BaseModel):
    id: int
    cafe_id: str
    cafe_name: str
    rating: Optional[float]
    image_url: Optional[str]
    added_at: datetime
    current_occupancy: Optional[int] = None
    occupancy_status: Optional[str] = None

    class Config:
        from_attributes = True

class UserPreferenceSchema(BaseModel):
    preferred_occupancy: Optional[str] = None
    budget_range: Optional[str] = None
    max_distance_km: Optional[float] = None
    cafe_type: Optional[str] = None
    primary_purpose: Optional[str] = None
    seating: Optional[str] = None
    wifi_required: Optional[bool] = None
    charging_ports_required: Optional[bool] = None
    pet_friendly: Optional[bool] = None
    parking_required: Optional[bool] = None

    class Config:
        from_attributes = True

class NotificationSettingSchema(BaseModel):
    notify_crowd: Optional[bool] = None
    notify_reservation: Optional[bool] = None
    notify_ai_updates: Optional[bool] = None
    notify_occupancy_alerts: Optional[bool] = None
    notify_new_cafes: Optional[bool] = None

    class Config:
        from_attributes = True

class ActivityHistoryResponse(BaseModel):
    id: int
    action_type: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AIHistoryResponse(BaseModel):
    id: int
    query: str
    created_at: datetime

    class Config:
        from_attributes = True
