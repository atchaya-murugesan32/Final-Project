import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.auth.security import create_access_token
import requests

token = create_access_token("test@example.com")
print("Generated Token:", token)

# create a reservation request
url = "http://localhost:8000/reservations/create"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
data = {
    "cafe_id": "test_cafe",
    "cafe_name": "Test Cafe",
    "reservation_date": "2026-06-30",
    "reservation_time": "10:00 AM",
    "num_people": 2,
    "special_request": ""
}

try:
    res = requests.post(url, json=data, headers=headers)
    print("Status:", res.status_code)
    print("Response:", res.json())
except Exception as e:
    print("Error:", repr(e))
