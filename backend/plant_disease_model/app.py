import json
import torch

from fastapi import FastAPI, UploadFile, File
from PIL import Image
from io import BytesIO

from model import model
from dataset import eval_transform


# --------------------------------------------------
# Create FastAPI app
# --------------------------------------------------

app = FastAPI(
    title="Plant Disease Detection API",
    description="API for detecting plant diseases from uploaded images"
)


# --------------------------------------------------
# Device
# --------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


import os

# --------------------------------------------------
# Get current directory path
# --------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# --------------------------------------------------
# Load trained model
# --------------------------------------------------

checkpoint = torch.load(
    os.path.join(CURRENT_DIR, "best_model.pth"),
    map_location=device
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)
model.eval()

print("Model loaded successfully!")


# --------------------------------------------------
# Load class mapping
# --------------------------------------------------

with open(os.path.join(CURRENT_DIR, "class_mapping.json"), "r") as f:
    class_mapping = json.load(f)

print("Class mapping loaded successfully!")


# --------------------------------------------------
# Home endpoint
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Plant Disease Detection API is running!"
    }


# --------------------------------------------------
# Prediction endpoint
# --------------------------------------------------

@app.post("/predict-disease")
async def predict_disease(
    file: UploadFile = File(...)
):

    # Read uploaded image
    image_bytes = await file.read()

    # Open image using Pillow
    image = Image.open(
        BytesIO(image_bytes)
    ).convert("RGB")


    # ----------------------------------------------
    # Preprocess image
    # ----------------------------------------------

    image_tensor = eval_transform(image)

    # Add batch dimension
    image_tensor = image_tensor.unsqueeze(0)

    # Move to CPU/GPU
    image_tensor = image_tensor.to(device)


    # ----------------------------------------------
    # Make prediction
    # ----------------------------------------------

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted_index = torch.max(
            probabilities,
            dim=1
        )


    # Convert prediction to normal Python values
    predicted_index = predicted_index.item()

    confidence = confidence.item() * 100

    # Get disease name
    disease = class_mapping[
        str(predicted_index)
    ]


    # ----------------------------------------------
    # Return result
    # ----------------------------------------------

    return {
        "filename": file.filename,
        "predicted_disease": disease,
        "confidence": round(confidence, 2)
    }