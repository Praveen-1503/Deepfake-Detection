from tensorflow.keras.models import load_model
model = load_model("best_subset_model.h5")
print(model.summary())
