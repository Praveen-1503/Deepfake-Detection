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
import json

# Load environment variables
load_dotenv()

# IBM credentials
IBM_API_KEY = os.getenv("IBM_API_KEY")
IBM_REGION = os.getenv("IBM_REGION")
IBM_GRANITE_ENDPOINT = os.getenv("IBM_GRANITE_ENDPOINT")
IBM_SPACE_ID = os.getenv("IBM_SPACE_ID")  # Deployment space ID (preferred)
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID")  # Project ID (fallback)

# Flask app
app = Flask(__name__)
CORS(app)

# Load your trained model
MODEL_PATH = "best_subset_model.h5"
model = load_model(MODEL_PATH)

# ✅ IBM Watsonx Granite setup
granite_model = None
watsonx_available = False

try:
    from ibm_watsonx_ai import Credentials
    from ibm_watsonx_ai.foundation_models import ModelInference
    
    # Set up credentials - use environment variable for region
    credentials = Credentials(
        url=f"https://{IBM_REGION}.ml.cloud.ibm.com",
        api_key=IBM_API_KEY
    )
    
    # Use space_id if available, otherwise use project_id
    model_kwargs = {
        "model_id": "ibm/granite-3-8b-instruct",
        "credentials": credentials,
        "params": {
            "decoding_method": "greedy",
            "max_new_tokens": 150,
            "min_new_tokens": 10,
            "temperature": 0.7,
            "top_k": 50,
            "top_p": 1,
            "repetition_penalty": 1.1
        }
    }
    
    # Prefer space_id over project_id
    if IBM_SPACE_ID and IBM_SPACE_ID != "your-space-id-here-after-creating-deployment-space":
        model_kwargs["space_id"] = IBM_SPACE_ID
        print(f"🔧 Using Deployment Space ID: {IBM_SPACE_ID}")
    elif IBM_PROJECT_ID:
        model_kwargs["project_id"] = IBM_PROJECT_ID
        print(f"🔧 Using Project ID: {IBM_PROJECT_ID}")
    else:
        raise ValueError("Either IBM_SPACE_ID or IBM_PROJECT_ID must be set")
    
    granite_model = ModelInference(**model_kwargs)
    
    # Test the connection
    test_response = granite_model.generate_text(prompt="Test")
    print("✅ IBM Watsonx Granite connected and tested successfully!")
    print(f"✅ Test response: {test_response[:30]}...")
    watsonx_available = True
    
except Exception as e:
    print(f"⚠️ Watsonx initialization failed: {e}")
    print("⚠️ Using fallback explanations")
    granite_model = None
    watsonx_available = False

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
    prompt = f"""
    You are an AI assistant helping to explain deepfake detections.
    The detector classified the image as '{label}' with {confidence}% confidence.
    Explain briefly (in one sentence) why the system might consider the image {label.lower()}.
    """

    try:
        response = granite_model.generate_text(prompt)
        explanation = response['results'][0]['generated_text']
        return explanation.strip()
    except Exception as e:
        print("⚠️ Granite Error:", e)
        return "Explanation unavailable."


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img = Image.open(io.BytesIO(file.read()))
    input_data = preprocess_image(img)

    # Get model prediction
    pred = model.predict(input_data)[0][0]
    label = "Real" if pred > 0.5 else "Deepfake"
    confidence = round(float(pred if pred > 0.5 else 1 - pred) * 100, 2)

    # ✅ Ask IBM Granite to explain the result (with fallback)
    explanation = None
    
    if granite_model is not None:
        try:
            prompt = (
                f"You are an AI visual forensics expert. "
                f"Explain in 2 sentences why this image might be classified as {label} "
                f"with {confidence}% confidence. "
                f"Focus on texture, lighting, symmetry, and realism of facial features."
            )

            granite_response = granite_model.generate_text(prompt=prompt)
            explanation = granite_response.strip()
            print(f"✅ Granite explanation generated: {explanation[:50]}...")
        except Exception as e:
            print(f"⚠️ Granite Error: {str(e)}")
            explanation = None
    
    # Fallback explanation when Granite API fails or is not available
    if explanation is None:
        if label == "Deepfake":
            if confidence > 90:
                explanation = "The model detected strong anomalies in facial features, texture inconsistencies, or unnatural lighting patterns commonly associated with AI-generated or manipulated images."
            elif confidence > 70:
                explanation = "The image shows noticeable irregularities in facial symmetry, skin texture, or lighting that suggest potential manipulation or synthetic generation."
            else:
                explanation = "The model identified subtle irregularities that may indicate image manipulation, though the confidence level suggests further analysis may be needed."
        else:  # Real
            if confidence > 90:
                explanation = "The image exhibits natural facial features, consistent lighting, realistic skin textures, and authentic patterns typical of genuine photographs."
            elif confidence > 70:
                explanation = "The model found mostly natural characteristics in facial features and lighting, suggesting this is likely an authentic image with minimal manipulation."
            else:
                explanation = "The image appears genuine with natural features, though some ambiguous characteristics prevent higher confidence in this assessment."

    return jsonify({
        "detection": label,
        "confidence": confidence,
        "explanation": explanation
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
