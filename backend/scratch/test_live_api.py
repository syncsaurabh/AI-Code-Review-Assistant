import requests
import json

url = "http://127.0.0.1:8000/api/v1/review"
payload = {
    "code": "def hello():\n    print('hello world')",
    "language": "python"
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", json.dumps(response.json(), indent=2))
    except Exception:
        print("Response Text:", response.text)
except Exception as e:
    print("Request failed:", e)
