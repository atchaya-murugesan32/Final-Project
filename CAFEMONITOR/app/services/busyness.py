"""
Busyness service is currently running in MOCK mode.

BestTime API integration is intentionally disabled for now.
All functions below return deterministic mock values so frontend flow can keep working.
"""

# -----------------------------------------------------------------------------
# Original BestTime API implementation (commented out on purpose)
# -----------------------------------------------------------------------------
# import requests
# from requests import exceptions as req_exc
# from app.config.settings import settings
#
# REQUEST_TIMEOUT_SECONDS = 15
#
#
# def _parse_json_response(response: requests.Response, context: str):
#     try:
#         return response.json()
#     except ValueError:
#         snippet = (response.text or "")[:300]
#         print(
#             f"[{context}] ERROR: Response is not valid JSON. "
#             f"status={response.status_code} body={snippet}"
#         )
#         return None
#
#
# def get_forecast(venue_name, venue_address):
#     url = "https://besttime.app/api/v1/forecasts"
#     params = {
#         "api_key_private": settings.BESTTIME_API_PRIVATE_KEY,
#         "venue_name": venue_name,
#         "venue_address": venue_address,
#     }
#     try:
#         response = requests.post(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
#         response.raise_for_status()
#         data = _parse_json_response(response, "FORECAST")
#         if data is None:
#             print("[FORECAST] ERROR: Could not parse forecast response.")
#             return None
#
#         venue_id = data.get("venue_info", {}).get("venue_id")
#         if not venue_id:
#             print("[FORECAST] INFO: No venue_id returned for this venue query.")
#         return venue_id
#     except req_exc.Timeout:
#         print(
#             f"[FORECAST] TIMEOUT: No response from BestTime within "
#             f"{REQUEST_TIMEOUT_SECONDS}s. Check internet, firewall, or endpoint availability."
#         )
#         return None
#     except req_exc.HTTPError as err:
#         status = err.response.status_code if err.response is not None else "unknown"
#         body = (err.response.text[:300] if err.response is not None and err.response.text else "")
#         print(f"[FORECAST] HTTP ERROR: status={status} body={body}")
#         return None
#     except req_exc.RequestException as err:
#         print(f"[FORECAST] REQUEST ERROR: {err}")
#         return None
#     except Exception as err:
#         print(f"[FORECAST] UNEXPECTED ERROR: {err}")
#         return None
#
#
# def get_live_busyness(venue_id):
#     url = "https://besttime.app/api/v1/forecasts/now"
#     params = {
#         "api_key_public": settings.BESTTIME_API_PUBLIC_KEY,
#         "venue_id": venue_id,
#     }
#     try:
#         response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
#         response.raise_for_status()
#         data = _parse_json_response(response, "LIVE")
#         if data is None:
#             print("[LIVE] ERROR: Could not parse live busyness response.")
#             return None
#         return data
#     except req_exc.Timeout:
#         print(
#             f"[LIVE] TIMEOUT: No response from BestTime within "
#             f"{REQUEST_TIMEOUT_SECONDS}s. Check internet, firewall, or endpoint availability."
#         )
#         return None
#     except req_exc.HTTPError as err:
#         status = err.response.status_code if err.response is not None else "unknown"
#         body = (err.response.text[:300] if err.response is not None and err.response.text else "")
#         print(f"[LIVE] HTTP ERROR: status={status} body={body}")
#         return None
#     except req_exc.RequestException as err:
#         print(f"[LIVE] REQUEST ERROR: {err}")
#         return None
#     except Exception as err:
#         print(f"[LIVE] UNEXPECTED ERROR: {err}")
#         return None


# def get_busyness(cafe_name: str, city: str):

#     url = "https://besttime.app/api/v1/forecasts/live"

#     payload = {
#         "api_key_private": settings.BESTTIME_API_KEY,
#         "venue_name": cafe_name,
#         "venue_address": city
#     }

#     response = requests.post(url, json=payload)

#     data = response.json()

#     print(data)

#     if "analysis" in data:
#         score = data["analysis"].get("venue_live_busyness", 0)

#         if score >= 70:
#             return "Busy"

#         elif score >= 40:
#             return "Moderate"

#         return "Free"

#     return "Unknown"


# API_KEY = "YOUR_BESTTIME_API_KEY"
# REQUEST_TIMEOUT_SECONDS = 15


def _seed(value: str) -> int:
    return sum(ord(c) for c in str(value or ""))


def _mock_from_seed(seed_value: str):
    percent = 15 + (_seed(seed_value) % 76)  # 15-90
    if percent < 35:
        return percent, "Quiet", "low"
    if percent < 70:
        return percent, "Moderate", "average"
    return percent, "Busy", "high"


def build_mock_venue_id(venue_name, venue_address):
    return f"mock-{_seed(f'{venue_name}|{venue_address}') % 1000000:06d}"


def simplify_live_busyness(data):
    seed_source = ""
    if isinstance(data, dict):
        seed_source = (
            data.get("venue_id")
            or data.get("venue_info", {}).get("venue_id")
            or str(data)
        )
    score, label, description = _mock_from_seed(seed_source)

    return {
        "busyness": label,
        "busyness_percent": score,
        "busyness_description": description,
    }

# 1. Create/get a forecast for a venue (this also gives you the venue_id)
def get_forecast(venue_name, venue_address):
    # BestTime API call disabled. Returning deterministic mock venue ID.
    return build_mock_venue_id(venue_name, venue_address)


# 2. Use that venue_id to get live/NOW foot traffic
def get_live_busyness(venue_id):
    # BestTime API call disabled. Returning deterministic mock payload.
    score, label, description = _mock_from_seed(venue_id)
    return {
        "venue_id": venue_id,
        "analysis": {
            "venue_live_busyness": score,
            "venue_live_busyness_level": label,
            "venue_live_busyness_desc": description,
        },
    }


if __name__ == "__main__":
    venue_id = get_forecast("Starbucks", "1 Princes Street, Edinburgh, UK")
    print("VENUE ID:", venue_id)

    if venue_id:
        print("LIVE RESPONSE:", get_live_busyness(venue_id))