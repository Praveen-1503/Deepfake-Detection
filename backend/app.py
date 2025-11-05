# backend/app.py
import os
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
from dotenv import load_dotenv
import requests
from flask_cors import CORS

# Load environment variables
load_dotenv()

# IBM credentials
IBM_API_KEY = os.getenv("IBM_API_KEY")
IBM_REGION = os.getenv("IBM_REGION")
IBM_GRANITE_ENDPOINT = os.getenv("IBM_GRANITE_ENDPOINT")

# Flask app
app = Flask(__name__)
CORS(app)

# Load your trained model
MODEL_PATH = "best_subset_model.h5"
model = load_model(MODEL_PATH)

import numpy as np
from PIL import Image

def preprocess_image(image):
    # Ensure correct size for your model
    image = image.convert("RGB")               # Convert to RGB (3 channels)
    image = image.resize((224, 224))           # ✅ Match model input
    image = np.array(image).astype("float32")  # Convert to float
    # NOTE: Do NOT normalize here - the model has a Rescaling layer that handles normalization
    image = np.expand_dims(image, axis=0)      # Add batch dimension
    return image


# Call IBM Granite API
def get_explanation(label, confidence):
    if not IBM_API_KEY:
        return "IBM Granite not connected."
    prompt = f"An image was classified as {label} with {confidence:.2f}% confidence. Explain this briefly."
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {IBM_API_KEY}"
    }
    data = {
        "model_id": "ibm/granite-13b-instruct",
        "input": prompt
    }
    try:
        response = requests.post(IBM_GRANITE_ENDPOINT, headers=headers, json=data, timeout=10)
        result = response.json()
        if "results" in result and len(result["results"]) > 0:
            return result["results"][0]["generated_text"]
        return "Explanation unavailable."
    except Exception as e:
        print("Error calling Granite:", e)
        return "Failed to connect to IBM Granite."

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img = Image.open(io.BytesIO(file.read()))
    input_data = preprocess_image(img)

    # Get prediction
    prediction = model.predict(input_data)
    pred = prediction[0][0]
    
    # Debug: Print raw prediction value
    print(f"🔍 Raw prediction value: {pred}")
    print(f"🔍 Prediction shape: {prediction.shape}")
    
    # NOTE: Model outputs are inverted - low values = fake, high values = real
    # So we flip the interpretation
    label = "Real" if pred > 0.5 else "Deepfake"
    confidence = (pred if pred > 0.5 else 1 - pred) * 100

    explanation = get_explanation(label, confidence)

    return jsonify({
        "detection": label,
        "confidence": round(float(confidence), 2),
        "explanation": explanation
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
