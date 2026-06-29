import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import CafeOccupancy
import requests
from app.auth.security import create_access_token

db = SessionLocal()
cafe = db.query(CafeOccupancy).filter(CafeOccupancy.cafe_id == "busy_cafe").first()
if not cafe:
    cafe = CafeOccupancy(cafe_id="busy_cafe", cafe_name="Busy Cafe", occupancy_percent=80, status="Busy", source="mock")
    db.add(cafe)
    db.commit()

token = create_access_token("test@example.com")
url = "http://localhost:8000/reservations/create"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
data = {
    "cafe_id": "busy_cafe",
    "cafe_name": "Busy Cafe",
    "reservation_date": "2026-06-30",
    "reservation_time": "12:00 PM",
    "num_people": 2
}

try:
    res = requests.post(url, json=data, headers=headers)
    print("Status:", res.status_code)
    print("Response:", res.json())
except Exception as e:
    print("Error:", repr(e))
