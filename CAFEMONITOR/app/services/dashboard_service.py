from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.db_models import User, FavoriteCafe, Reservation, ActivityLog, AIHistory, UserPreference, NotificationSetting
from app.models.dashboard_models import UserProfileUpdate, DashboardStats, UserPreferenceSchema, NotificationSettingSchema

def get_dashboard_stats(user_id: int, db: Session) -> DashboardStats:
    total_reservations = db.query(Reservation).filter(Reservation.user_id == user_id).count()
    favorite_cafes = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == user_id).count()
    ai_used = db.query(AIHistory).filter(AIHistory.user_id == user_id).count()
    
    return DashboardStats(
        total_visits=0,
        total_reservations=total_reservations,
        favorite_cafes_count=favorite_cafes,
        ai_recommendations_used=ai_used,
        reviews_submitted=0,
        avg_rating_given=0.0
    )

def update_user_profile(user_id: int, data: UserProfileUpdate, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.name:
        user.full_name = data.name
    if data.email:
        user.email = data.email
    if data.phone:
        user.phone_number = data.phone
    if data.profile_picture:
        user.profile_picture = data.profile_picture
        
    db.commit()
    db.refresh(user)
    return user

def get_favorites(user_id: int, db: Session):
    favorites = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == user_id).all()
    result = []
    for fav in favorites:
        fav_dict = {
            "id": fav.id,
            "cafe_id": fav.cafe_id,
            "cafe_name": fav.cafe_name,
            "rating": fav.rating,
            "image_url": fav.image_url,
            "added_at": fav.added_at,
            "current_occupancy": None,
            "occupancy_status": None
        }
        result.append(fav_dict)
    return result

from app.models.dashboard_models import FavoriteCafeCreate

def add_favorite(user_id: int, data: FavoriteCafeCreate, db: Session):
    existing = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == user_id, FavoriteCafe.cafe_id == data.cafe_id).first()
    if existing:
        return {"message": "Already favorited"}
    new_fav = FavoriteCafe(
        user_id=user_id,
        cafe_id=data.cafe_id,
        cafe_name=data.cafe_name,
        image_url=data.image_url,
        rating=data.rating
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return {"message": "Added to favorites"}

def remove_favorite(user_id: int, cafe_id: str, db: Session):
    existing = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == user_id, FavoriteCafe.cafe_id == cafe_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(existing)
    db.commit()
    return {"message": "Removed from favorites"}

def get_preferences(user_id: int, db: Session):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not pref:
        pref = UserPreference(user_id=user_id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

def update_preferences(user_id: int, data: UserPreferenceSchema, db: Session):
    pref = get_preferences(user_id, db)
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pref, key, value)
    db.commit()
    db.refresh(pref)
    return pref

def get_notifications(user_id: int, db: Session):
    notif = db.query(NotificationSetting).filter(NotificationSetting.user_id == user_id).first()
    if not notif:
        notif = NotificationSetting(user_id=user_id)
        db.add(notif)
        db.commit()
        db.refresh(notif)
    return notif

def update_notifications(user_id: int, data: NotificationSettingSchema, db: Session):
    notif = get_notifications(user_id, db)
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(notif, key, value)
    db.commit()
    db.refresh(notif)
    return notif

def get_activity_history(user_id: int, db: Session):
    return db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.created_at.desc()).limit(20).all()

def get_ai_history(user_id: int, db: Session):
    return db.query(AIHistory).filter(AIHistory.user_id == user_id).order_by(AIHistory.created_at.desc()).limit(20).all()

def log_activity(user_id: int, action_type: str, description: str, db: Session):
    log = ActivityLog(user_id=user_id, action_type=action_type, description=description)
    db.add(log)
    db.commit()
