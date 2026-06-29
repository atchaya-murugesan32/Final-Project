from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from app.models.db_models import Reservation, CafeOccupancy, User
from app.models.reservation_models import ReservationCreate

def create_reservation(data: ReservationCreate, user: User, db: Session):
    # Check if the date is in the past
    # For simplicity, we just parse the date. We assume 'YYYY-MM-DD' format.
    try:
        reservation_date_obj = datetime.strptime(data.reservation_date, "%Y-%m-%d").date()
        if reservation_date_obj < datetime.now().date():
            raise HTTPException(status_code=400, detail="Reservation date cannot be in the past.")
    except ValueError:
        pass # If format is different, we skip strict past checking or let frontend handle it

    # Check cafe occupancy
    cafe_occ = db.query(CafeOccupancy).filter(CafeOccupancy.cafe_id == data.cafe_id).first()
    if cafe_occ:
        if cafe_occ.occupancy_percent >= 71:
            raise HTTPException(status_code=400, detail="Table reservation is currently unavailable because this cafe is busy.")

    # Check for duplicate bookings
    existing = db.query(Reservation).filter(
        Reservation.user_id == user.id,
        Reservation.cafe_id == data.cafe_id,
        Reservation.reservation_date == data.reservation_date,
        Reservation.reservation_time == data.reservation_time,
        Reservation.status.in_(["Pending", "Confirmed"])
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You already have a reservation at this cafe for this date and time.")

    import random
    table_assigned = f"Table {random.randint(1, 25)}"
    
    # Create reservation
    new_res = Reservation(
        user_id=user.id,
        cafe_id=data.cafe_id,
        cafe_name=data.cafe_name,
        reservation_date=data.reservation_date,
        reservation_time=data.reservation_time,
        num_people=data.num_people,
        special_request=data.special_request,
        status="Confirmed", # Auto-confirm for now
        table_number=table_assigned
    )
    
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    
    return new_res

def get_user_reservations(user_id: int, db: Session):
    return db.query(Reservation).filter(Reservation.user_id == user_id).order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc()).all()

def cancel_reservation(reservation_id: int, user_id: int, db: Session):
    res = db.query(Reservation).filter(Reservation.id == reservation_id, Reservation.user_id == user_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if res.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Reservation is already cancelled")
        
    res.status = "Cancelled"
    db.commit()
    db.refresh(res)
    return res
