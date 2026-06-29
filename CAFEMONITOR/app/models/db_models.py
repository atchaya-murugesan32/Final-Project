from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String, nullable=True)
    password_hash = Column(String)
    profile_picture = Column(String, nullable=True)
    account_status = Column(String, default="Active")
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class UserPreference(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    budget_range = Column(String, default="Any")
    preferred_occupancy = Column(String, default="Any")
    max_distance_km = Column(Float, default=10.0)
    primary_purpose = Column(String, default="Any")
    seating = Column(String, default="Any")
    wifi_required = Column(Boolean, default=False)
    charging_ports_required = Column(Boolean, default=False)
    pet_friendly = Column(Boolean, default=False)
    parking_required = Column(Boolean, default=False)

class NotificationSetting(Base):
    __tablename__ = "notification_settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    notify_occupancy_alerts = Column(Boolean, default=True)
    notify_reservation = Column(Boolean, default=True)
    notify_favorite_alerts = Column(Boolean, default=True)
    notify_ai_updates = Column(Boolean, default=True)
    notify_nearby_cafes = Column(Boolean, default=False)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    action_type = Column(String) # e.g. "Logged In", "Reserved a Table", "Added Favorite"
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AIHistory(Base):
    __tablename__ = "ai_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    query = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    cafe_id = Column(String, index=True)
    cafe_name = Column(String)
    reservation_date = Column(String)
    reservation_time = Column(String)
    num_people = Column(Integer)
    special_request = Column(String, nullable=True)
    status = Column(String, default="Upcoming")
    table_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class FavoriteCafe(Base):
    __tablename__ = "favorite_cafes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    cafe_id = Column(String, index=True)
    cafe_name = Column(String)
    image_url = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CafeOccupancy(Base):
    __tablename__ = "cafe_occupancies"
    id = Column(Integer, primary_key=True, index=True)
    cafe_id = Column(String, unique=True, index=True)
    occupancy_percent = Column(Integer, default=0)
    status = Column(String, default="Quiet")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

