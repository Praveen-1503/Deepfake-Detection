import requests
import json

url = "http://127.0.0.1:5002/predict"
file_path = "testing images/resized_fake/fake_1002.jpg"

print(f"Testing: {file_path}\n")

with open(file_path, "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)

print(f"Status Code: {response.status_code}\n")

if response.status_code == 200:
    result = json.loads(response.text)
    print(f"Detection:    {result['detection']}")
    print(f"Confidence:   {result['confidence']}%")
    print(f"Explanation:  {result['explanation']}")
else:
    print(f"Error: {response.text}")
