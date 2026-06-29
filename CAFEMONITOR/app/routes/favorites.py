from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.db_models import User, FavoriteCafe

router = APIRouter()

class FavoriteAddRequest(BaseModel):
    cafe_id: str
    cafe_name: str

class FavoriteResponse(BaseModel):
    cafe_id: str
    cafe_name: str

@router.post("/add")
def add_favorite(data: FavoriteAddRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == current_user.id, FavoriteCafe.cafe_id == data.cafe_id).first()
    if existing:
        return {"message": "Already favorited"}
    
    new_fav = FavoriteCafe(user_id=current_user.id, cafe_id=data.cafe_id, cafe_name=data.cafe_name)
    db.add(new_fav)
    db.commit()
    return {"message": "Added to favorites"}

@router.delete("/remove/{cafe_id}")
def remove_favorite(cafe_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fav = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == current_user.id, FavoriteCafe.cafe_id == cafe_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"message": "Removed from favorites"}

@router.get("/", response_model=List[FavoriteResponse])
def get_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favs = db.query(FavoriteCafe).filter(FavoriteCafe.user_id == current_user.id).all()
    return favs
