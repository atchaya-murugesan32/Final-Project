import requests
import json
import time

BASE_URL = "http://localhost:8000"
test_email = f"smoketest_{int(time.time())}@example.com"
password = "password123"

print("1. Creating User...")
res = requests.post(f"{BASE_URL}/auth/signup", json={
    "full_name": "Smoke Test",
    "username": f"smoke_{int(time.time())}",
    "email": test_email,
    "password": password
})
print(res.status_code, res.text)

print("\n2. Logging in...")
res = requests.post(f"{BASE_URL}/auth/login", data={"username": test_email, "password": password})
token = res.json().get("access_token")
print(res.status_code, "Token acquired" if token else "Failed to get token", res.text if not token else "")
headers = {"Authorization": f"Bearer {token}"}

print("\n3. Testing /dashboard/profile...")
res = requests.get(f"{BASE_URL}/dashboard/profile", headers=headers)
print(res.status_code, res.text)

print("\n4. Testing /dashboard/stats...")
res = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
print(res.status_code, res.text)

print("\n5. Testing /dashboard/favorites...")
res = requests.get(f"{BASE_URL}/dashboard/favorites", headers=headers)
print(res.status_code, res.text)

print("\n6. Testing /dashboard/preferences...")
res = requests.get(f"{BASE_URL}/dashboard/preferences", headers=headers)
print(res.status_code, res.text)

print("\n7. Testing /dashboard/notifications...")
res = requests.get(f"{BASE_URL}/dashboard/notifications", headers=headers)
print(res.status_code, res.text)

print("\n8. Testing /dashboard/activity...")
res = requests.get(f"{BASE_URL}/dashboard/activity", headers=headers)
print(res.status_code, res.text)

print("\n9. Testing /dashboard/ai_history...")
res = requests.get(f"{BASE_URL}/dashboard/ai_history", headers=headers)
print(res.status_code, res.text)
