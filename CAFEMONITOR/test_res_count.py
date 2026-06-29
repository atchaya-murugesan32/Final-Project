import sys
import os

sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import User
from app.services.dashboard_service import get_dashboard_stats
from app.models.reservation_models import ReservationRequest
from app.services.reservation_service import create_reservation
from datetime import datetime, timedelta

db = SessionLocal()
user = db.query(User).filter(User.email == "953624104022@ritrjpm.ac.in").first()

if user:
    # Get stats before
    stats_before = get_dashboard_stats(user.id, db)
    print("Stats Before:", stats_before.total_reservations)

    # Create a reservation
    req = ReservationRequest(
        cafe_id="test_cafe_123",
        cafe_name="Test Cafe",
        party_size=2,
        reservation_time=datetime.utcnow() + timedelta(hours=1),
        special_requests="Near window"
    )
    res = create_reservation(user.id, req, db)
    print("Reservation created:", res.id)

    # Get stats after
    stats_after = get_dashboard_stats(user.id, db)
    print("Stats After:", stats_after.total_reservations)
else:
    print("User not found")
