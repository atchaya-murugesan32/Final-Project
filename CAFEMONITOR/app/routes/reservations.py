from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.db_models import User
from app.models.reservation_models import ReservationCreate, ReservationResponse
from app.services.reservation_service import create_reservation, get_user_reservations, cancel_reservation

router = APIRouter()

@router.post("/create", response_model=ReservationResponse)
def api_create_reservation(data: ReservationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_reservation(data, current_user, db)

@router.get("/my-bookings", response_model=List[ReservationResponse])
def api_get_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_reservations(current_user.id, db)

@router.put("/{reservation_id}/cancel", response_model=ReservationResponse)
def api_cancel_reservation(reservation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cancel_reservation(reservation_id, current_user.id, db)
