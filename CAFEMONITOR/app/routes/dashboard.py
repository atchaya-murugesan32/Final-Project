from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.db_models import User
from app.models.dashboard_models import (
    UserProfileUpdate, DashboardStats, FavoriteCafeResponse, 
    UserPreferenceSchema, NotificationSettingSchema, 
    ActivityHistoryResponse, AIHistoryResponse
)
from app.services.dashboard_service import (
    get_dashboard_stats, update_user_profile, get_favorites,
    get_preferences, update_preferences, get_notifications, update_notifications,
    get_activity_history, get_ai_history
)

router = APIRouter()

@router.get("/profile")
def api_get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user

@router.put("/profile")
def api_update_profile(data: UserProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_user_profile(current_user.id, data, db)

@router.get("/stats", response_model=DashboardStats)
def api_get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_dashboard_stats(current_user.id, db)

@router.get("/favorites", response_model=List[FavoriteCafeResponse])
def api_get_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_favorites(current_user.id, db)

from app.models.dashboard_models import FavoriteCafeCreate
from app.services.dashboard_service import add_favorite, remove_favorite

@router.post("/favorites")
def api_add_favorite(data: FavoriteCafeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return add_favorite(current_user.id, data, db)

@router.delete("/favorites/{cafe_id}")
def api_remove_favorite(cafe_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return remove_favorite(current_user.id, cafe_id, db)

@router.get("/preferences", response_model=UserPreferenceSchema)
def api_get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_preferences(current_user.id, db)

@router.put("/preferences", response_model=UserPreferenceSchema)
def api_update_preferences(data: UserPreferenceSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_preferences(current_user.id, data, db)

@router.get("/notifications", response_model=NotificationSettingSchema)
def api_get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_notifications(current_user.id, db)

@router.put("/notifications", response_model=NotificationSettingSchema)
def api_update_notifications(data: NotificationSettingSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return update_notifications(current_user.id, data, db)

@router.get("/activity", response_model=List[ActivityHistoryResponse])
def api_get_activity(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_activity_history(current_user.id, db)

@router.get("/ai_history", response_model=List[AIHistoryResponse])
def api_get_ai_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_ai_history(current_user.id, db)
