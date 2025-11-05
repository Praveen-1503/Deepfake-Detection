import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import os

# Load the model
model = load_model("best_subset_model.h5")

print("🔍 Model Summary:")
model.summary()
print("\n")

# Preprocessing function (without /255 since model has Rescaling layer)
def preprocess_image(image_path):
    image = Image.open(image_path).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image).astype("float32")
    # Do NOT divide by 255 - model has a Rescaling layer
    image = np.expand_dims(image, axis=0)
    return image

# Test on multiple images
test_images = []
fake_dir = "testing images/resized_fake/"
real_dir = "testing images/resized_real/"

if os.path.exists(fake_dir):
    fake_images = [os.path.join(fake_dir, f) for f in os.listdir(fake_dir) if f.endswith(('.jpg', '.jpeg', '.png'))][:3]
    test_images.extend([(img, "FAKE") for img in fake_images])

if os.path.exists(real_dir):
    real_images = [os.path.join(real_dir, f) for f in os.listdir(real_dir) if f.endswith(('.jpg', '.jpeg', '.png'))][:3]
    test_images.extend([(img, "REAL") for img in real_images])

print("Testing predictions on sample images:")
print("-" * 60)

for img_path, expected in test_images:
    if not os.path.exists(img_path):
        continue
    
    input_data = preprocess_image(img_path)
    prediction = model.predict(input_data, verbose=0)
    pred_value = prediction[0][0]
    
    # Check statistics
    img_array = input_data[0]
    
    print(f"\n📷 {os.path.basename(img_path)} (Expected: {expected})")
    print(f"   Raw prediction: {pred_value:.6f}")
    print(f"   Prediction shape: {prediction.shape}")
    print(f"   Input shape: {input_data.shape}")
    print(f"   Input min/max/mean: {img_array.min():.3f} / {img_array.max():.3f} / {img_array.mean():.3f}")
    print(f"   Predicted class: {'DEEPFAKE' if pred_value > 0.5 else 'REAL'}")
    print(f"   Confidence: {(pred_value if pred_value > 0.5 else 1 - pred_value) * 100:.2f}%")

print("\n" + "=" * 60)
print("\n🔍 Checking model weights:")
# Check if model has learned anything
weights = model.get_weights()
print(f"Number of weight arrays: {len(weights)}")
if len(weights) > 0:
    print(f"First layer weight stats:")
    print(f"  Min: {weights[0].min():.6f}")
    print(f"  Max: {weights[0].max():.6f}")
    print(f"  Mean: {weights[0].mean():.6f}")
    print(f"  Std: {weights[0].std():.6f}")
