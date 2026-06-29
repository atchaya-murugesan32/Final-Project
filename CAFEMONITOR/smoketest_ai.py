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

# 3. Add Favorite
print("\n3. Adding Favorite...")
res = requests.post(f"{BASE_URL}/favorites/add", headers=headers, json={
    "cafe_id": "cafe123",
    "cafe_name": "Test Cafe"
})
print(res.status_code, res.json())

# 4. Chat with AI
print("\n4. Chatting with AI...")
res = requests.post(f"{BASE_URL}/ai/chat", headers=headers, json={
    "message": "Do you know what my favorite cafes are?"
})
print(res.status_code)
if res.status_code == 200:
    print(res.json().get("reply"))
else:
    print(res.text)

print("\nSmoke test complete!")
