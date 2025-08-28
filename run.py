import requests
import random
import time
from datetime import datetime, timedelta, timezone

API_URL = "https://smart-electric.onrender.com/api/energy/submit/"
USER_ID = "hemant0621"

def days_in_month(year, month):
    from calendar import monthrange
    return monthrange(year, month)[1]

def realistic_power_usage(month, hour):
    # Simulate higher usage in evenings, less in night
    if 6 <= hour < 18:
        base = 0.8 + 0.4 * (month - 6 if 1 <= month <= 12 else 0)/12  # Summer bump
    else:
        base = 0.5
    noise = random.uniform(-0.3, 0.3)
    return round(max(base + noise, 0.1), 2)

def realistic_solar_generation(month, hour):
    # Solar only during daylight, more in summer months
    if 7 <= hour <= 17:
        # Assume average power usage at this hour, then scale up
        expected_usage = realistic_power_usage(month, hour)
        solar_base = expected_usage * random.uniform(1.5, 2) 
        noise = random.uniform(-0.05, 0.05) * solar_base
        return round(max(solar_base + noise, 0.0), 2)
    return 0.0

def send_test_data(year=2024, delay=0):
    for month in range(8, 13):
        print(f"--- Month {month} ---")
        for day in range(20, days_in_month(year, month) + 1):
            for hour in range(24):
                timestamp = datetime(year, month, day, hour, tzinfo=timezone.utc)
                data = {
                    "user_id": USER_ID,
                    "timestamp": timestamp.isoformat(),
                    "power_usage": 0,         # kWh simulated
                    "solar_generation": realistic_solar_generation(month, hour), # kWh simulated
                }
                try:
                    response = requests.post(API_URL, json=data)
                    print(f"[{timestamp}] {response.status_code}: {response.text}")
                except Exception as e:
                    print("Error:", e)
                if delay:
                    time.sleep(delay)
    print("Year data submission completed.")

if __name__ == "__main__":
    send_test_data(year=2025, delay=0)  # delay=0 for speed, set >0 to throttle
    print("All data sent.")
