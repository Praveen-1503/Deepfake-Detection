import requests
import os
import json

# ✅ Flask API endpoint
url = "http://127.0.0.1:5002/predict"

# ✅ Test multiple images
test_images = [
    "/Users/praveen1517/Documents/LiveInLab - III/RealReveal/backend/testing images/resized_fake/fake_1002.jpg",
    "/Users/praveen1517/Documents/LiveInLab - III/RealReveal/backend/testing images/resized_real/real_1002.jpg",
]

# Also check if there are more images
fake_dir = "/Users/praveen1517/Documents/LiveInLab - III/RealReveal/backend/testing images/resized_fake/"
real_dir = "/Users/praveen1517/Documents/LiveInLab - III/RealReveal/backend/testing images/resized_real/"

# Get a few more test images
if os.path.exists(fake_dir):
    fake_images = [os.path.join(fake_dir, f) for f in os.listdir(fake_dir) if f.endswith(('.jpg', '.jpeg', '.png'))][:3]
    test_images.extend(fake_images[:2])

if os.path.exists(real_dir):
    real_images = [os.path.join(real_dir, f) for f in os.listdir(real_dir) if f.endswith(('.jpg', '.jpeg', '.png'))][:3]
    test_images.extend(real_images[:2])

# Remove duplicates
test_images = list(set(test_images))

print(f"Testing {len(test_images)} images...\n")

for file_path in test_images:
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        continue
    
    print(f"📷 Testing: {os.path.basename(file_path)}")
    
    # ✅ Send the image to your Flask backend
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)
    
    # ✅ Print the response
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        result = json.loads(response.text)
        print(f"   Detection: {result['detection']}")
        print(f"   Confidence: {result['confidence']}%")
        print(f"   Explanation: {result['explanation']}")
    else:
        print(f"   Error: {response.text}")
    print()
