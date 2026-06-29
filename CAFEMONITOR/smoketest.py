import requests
import json
import time

BASE_URL = "http://localhost:8000"
test_email = f"smoketest_{int(time.time())}@example.com"
password = "password123"

# 1. Create User
print("1. Creating User...")
res = requests.post(f"{BASE_URL}/auth/signup", json={
    "full_name": "Smoke Test",
    "username": f"smoke_{int(time.time())}",
    "email": test_email,
    "password": password
})
print(res.status_code, res.json())

# 2. Login
print("\n2. Logging in...")
res = requests.post(f"{BASE_URL}/auth/login", data={"username": test_email, "password": password})
token = res.json().get("access_token")
print(res.status_code, "Token acquired" if token else "Failed to get token")
headers = {"Authorization": f"Bearer {token}"}

# 3. Create Reservation
print("\n3. Creating Reservation...")
res = requests.post(f"{BASE_URL}/reservations/create", headers=headers, json={
    "cafe_id": "cafe123",
    "cafe_name": "Test Cafe",
    "reservation_date": "2030-01-01",
    "reservation_time": "14:00",
    "num_people": 2,
    "special_request": "Window seat please"
})
print(res.status_code, res.json())
res_data = res.json()
res_id = res_data.get("id")
print("Assigned Table:", res_data.get("table_number"))

# 4. View Dashboard
print("\n4. Viewing Dashboard (Reservations)...")
res = requests.get(f"{BASE_URL}/reservations/my-bookings", headers=headers)
print(res.status_code, f"Found {len(res.json())} bookings.")

# 5. Add Favorite
print("\n5. Adding Favorite...")
res = requests.post(f"{BASE_URL}/favorites/add", headers=headers, json={
    "cafe_id": "cafe123",
    "cafe_name": "Test Cafe"
})
print(res.status_code, res.json())

# 6. View Favorites
print("\n6. Viewing Favorites...")
res = requests.get(f"{BASE_URL}/favorites/", headers=headers)
print(res.status_code, f"Found {len(res.json())} favorites.")

# 7. Cancel Reservation
print("\n7. Canceling Reservation...")
res = requests.put(f"{BASE_URL}/reservations/{res_id}/cancel", headers=headers)
print(res.status_code, res.json())

# 8. Check Dashboard Cancelled status
print("\n8. Checking Cancelled Status...")
res = requests.get(f"{BASE_URL}/reservations/my-bookings", headers=headers)
bookings = res.json()
if bookings:
    print(f"Status of booking: {bookings[0].get('status')}")

print("\nSmoke test complete!")
