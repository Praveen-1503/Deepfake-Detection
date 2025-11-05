import os
from PIL import Image

# Base directory where your fake and real folders are
base_dir = "/Users/praveen1517/Documents/LiveInLab - III/RealReveal/backend/testing images"
folders = ["fake", "real"]

# Target resize size
TARGET_SIZE = (224, 224)

for folder in folders:
    input_folder = os.path.join(base_dir, folder)
    output_folder = os.path.join(base_dir, f"resized_{folder}")

    # Create output folder if not exists
    os.makedirs(output_folder, exist_ok=True)
    print(f"🔹 Processing: {input_folder} → Saving to: {output_folder}")

    for filename in os.listdir(input_folder):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)

            try:
                with Image.open(input_path) as img:
                    img = img.convert("RGB")  # Ensure RGB 3-channel
                    img = img.resize(TARGET_SIZE)
                    img.save(output_path, "JPEG", quality=95)
                print(f"✅ Resized: {filename}")
            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

print("\n🎉 All images resized to 224x224 and saved into 'resized_fake' and 'resized_real' folders!")

