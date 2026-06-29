import sys
sys.path.append("c:\\Users\\USER\\Desktop\\Final-Project\\CAFEMONITOR")
from app.database.connection import SessionLocal
from app.models.db_models import Reservation, User
import requests
from app.auth.security import create_access_token

db = SessionLocal()
res = db.query(Reservation).first()
if not res:
    print("No reservations in DB")
    sys.exit()

user = db.query(User).filter(User.id == res.user_id).first()
token = create_access_token(user.email)
url = f"http://localhost:8000/reservations/{res.id}/cancel"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.put(url, headers=headers)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", repr(e))
