# Plant Disease Detection Model

A deep learning-based plant disease classification system built using **PyTorch**, **MobileNetV3 Large**, and **FastAPI**.

The model accepts a plant/leaf image and predicts one of **31 plant disease/health classes**, returning the predicted class and confidence score.

---

## Model Performance

- **Architecture:** MobileNetV3 Large
- **Transfer learning:** Yes
- **Number of classes:** 31
- **Total dataset images:** 70,126
- **Train / Validation / Test split:** 70% / 15% / 15%
- **Best model checkpoint:** Epoch 11
- **Best validation accuracy:** 94.50%
- **Final test accuracy:** 94.74%
- **Weighted F1-score:** 94.73%

The final test set contained **10,519 images** that were not used during training.

---

## Supported Classes

### Corn
- `corn_blight`
- `corn_common_rust`
- `corn_gray_leaf_spot`
- `corn_healthy`

### Cotton
- `cotton_diseased_leaf`
- `cotton_diseased_plant`
- `cotton_healthy_leaf`
- `cotton_healthy_plant`

### Potato
- `potato_early_blight`
- `potato_healthy`
- `potato_late_blight`

### Rice
- `rice_bacterial_leaf_blight`
- `rice_bacterial_leaf_streak`
- `rice_bacterial_panicle_blight`
- `rice_blast`
- `rice_brown_spot`
- `rice_dead_heart`
- `rice_downy_mildew`
- `rice_healthy`
- `rice_hispa`
- `rice_tungro`

### Tomato
- `tomato_bacterial_spot`
- `tomato_early_blight`
- `tomato_healthy`
- `tomato_late_blight`
- `tomato_leaf_mold`
- `tomato_mosaic_virus`
- `tomato_septoria_leaf_spot`
- `tomato_spider_mites`
- `tomato_target_spot`
- `tomato_yellow_curl_virus`

---

# Project Structure

```text
plant-disease-model/
│
├── app.py
├── model.py
├── dataset.py
├── best_model.pth
├── class_mapping.json
├── requirements.txt
│
└── data/
    └── processed/        # Needed for training/evaluation, not required for API inference
```

## Important Files

### `best_model.pth`
Contains the trained model checkpoint, including:
- model weights
- optimizer state
- best epoch information
- validation loss
- validation accuracy

### `class_mapping.json`
Maps the model output index to the correct disease class name.

Example:

```json
{
    "0": "corn_blight",
    "1": "corn_common_rust"
}
```

### `model.py`
Defines the MobileNetV3 Large architecture used by the trained model.

**Do not change the architecture** unless the model is retrained. The saved weights must match the architecture exactly.

### `dataset.py`
Contains the image preprocessing transforms used during training and inference.

### `app.py`
FastAPI application that:
1. receives an uploaded image
2. preprocesses the image
3. runs model inference
4. converts the predicted index into a class name
5. returns the prediction and confidence

---

# API Usage

## Start the API

Activate the Python virtual environment and run:

```powershell
python -m uvicorn app:app --reload
```

The API will be available at:

- `http://127.0.0.1:8000`
- Swagger documentation: `http://127.0.0.1:8000/docs`

## Prediction Endpoint

### Endpoint

```text
POST /predict-disease
```

### Request

Send the image as `multipart/form-data`.

Field name:

```text
file
```

### Example Response

```json
{
    "filename": "leaf.jpg",
    "predicted_disease": "tomato_healthy",
    "confidence": 97.82
}
```

The `confidence` value is expressed as a percentage.

---

# Image Preprocessing

The website/frontend team does **not** need to preprocess the image before sending it to the API.

The backend performs preprocessing automatically.

The inference pipeline is:

```text
Uploaded image
        ↓
Convert to RGB
        ↓
Resize to 224 × 224
        ↓
Convert to PyTorch tensor
        ↓
Normalize using ImageNet mean/std
        ↓
Add batch dimension
        ↓
MobileNetV3 prediction
```

The preprocessing must remain consistent with the training pipeline.

The model uses:

```python
Resize((224, 224))
```

and ImageNet normalization:

```python
mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]
```

---

# Important Instructions for the Development Team

## 1. Do not change the model architecture

`best_model.pth` was trained specifically with the architecture in `model.py`.

Changing layers, output classes, or the model architecture can cause the checkpoint to fail to load.

Use the provided `model.py` together with `best_model.pth`.

---

## 2. Do not change the class mapping

The order of classes is critical.

The model predicts an integer from `0` to `30`. That integer must be converted using the provided `class_mapping.json`.

For example:

```text
Model output index = 2
        ↓
class_mapping.json
        ↓
corn_gray_leaf_spot
```

Do not manually reorder or recreate the class list.

---

## 3. Keep preprocessing exactly the same

This is one of the most important requirements.

The API must continue using the same preprocessing used during model training:

- convert image to RGB
- resize to `224 × 224`
- convert to tensor
- normalize using the specified ImageNet mean and standard deviation

Changing preprocessing can reduce prediction quality.

The frontend should send the original image to the API. The backend handles preprocessing.

---

## 4. Load the model once, not on every request

The model should be loaded when the FastAPI application starts.

Do **not** reload `best_model.pth` for every uploaded image.

Correct architecture:

```text
API starts
    ↓
Load model once into memory
    ↓
Receive many prediction requests
    ↓
Reuse the same loaded model
```

This reduces latency and unnecessary CPU/GPU usage.

---

## 5. Keep the model in evaluation mode

For inference, the model must use:

```python
model.eval()
```

Predictions should also run inside:

```python
with torch.no_grad():
```

This prevents gradient calculation and reduces inference overhead.

---

## 6. Validate uploaded files

The production API should validate uploads before inference.

Recommended checks:

- allow only supported image formats
- reject empty files
- set a maximum upload size
- handle corrupted images safely
- return clear HTTP error messages

Recommended formats:

- JPG / JPEG
- PNG

Do not assume every uploaded file is a valid image.

---

## 7. Use appropriate confidence handling

The API currently returns the top prediction confidence.

Important: a high confidence score does not guarantee that the prediction is correct.

For the website UI, consider showing:

```text
Prediction: Tomato Healthy
Confidence: 97.82%
```

Optionally, the development team can add a warning for predictions below a chosen confidence threshold, for example:

```text
Low-confidence prediction.
Please upload a clearer image.
```

The exact threshold should be validated using real-world testing rather than chosen arbitrarily.

---

## 8. Understand the model's known weaker areas

The overall final test accuracy is **94.74%**, but performance varies by class.

A notable weak class was:

- `corn_gray_leaf_spot`

It was frequently confused with:

- `corn_blight`

Several visually similar rice diseases also showed more confusion than the strongest classes.

The website should therefore avoid presenting predictions as medical/agricultural certainty. A suitable disclaimer is recommended.

Example:

> This prediction is generated by an AI model and should be used as an assistive indication. For important crop-management decisions, consult an agricultural expert.

---

## 9. Production deployment considerations

For production, do not use:

```text
uvicorn app:app --reload
```

The `--reload` option is intended for development.

Use an appropriate production deployment configuration with:

- environment-based configuration
- logging
- error monitoring
- HTTPS
- reverse proxy/load balancing where needed
- resource limits
- request size limits

The final production setup depends on the hosting platform and expected traffic.

---

## 10. CPU vs GPU inference

The model can run on CPU.

For low or moderate traffic, CPU inference may be sufficient.

For high traffic or lower-latency requirements, GPU inference can be considered.

The current backend automatically selects CUDA when available:

```python
device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)
```

---

## 11. Security and API integration

When connecting the website frontend to the API:

- configure CORS correctly
- do not expose unnecessary server internals
- validate file uploads
- limit request size
- consider rate limiting for public APIs
- use HTTPS in production
- add authentication if the API should not be publicly accessible

---

## 12. Dataset is not required for normal inference

The complete training dataset is **not required** to run the prediction API.

For inference, the essential files are:

```text
app.py
model.py
dataset.py
best_model.pth
class_mapping.json
```

This makes deployment significantly smaller than the training environment.

---

# Recommended Frontend Flow

```text
User selects plant image
        ↓
Frontend optionally shows image preview
        ↓
Frontend sends image as multipart/form-data
        ↓
POST /predict-disease
        ↓
Backend preprocesses image
        ↓
Model predicts disease
        ↓
API returns JSON
        ↓
Frontend displays:
    - predicted disease
    - confidence
    - optional disclaimer
```

---

# Model Evaluation Summary

The model was evaluated using an untouched test set of **10,519 images**.

Evaluation included:

- overall test accuracy
- confusion matrix
- per-class precision
- per-class recall
- per-class F1-score
- analysis of common misclassifications

Final results:

```text
Final Test Accuracy: 94.74%
Macro Precision:    94.29%
Macro Recall:       93.59%
Macro F1-score:     93.79%
Weighted F1-score:  94.73%
```

---

# Quick Checklist for Website Integration

Before deployment, confirm:

- [ ] `best_model.pth` is present
- [ ] `class_mapping.json` is present
- [ ] `model.py` matches the trained architecture
- [ ] preprocessing remains unchanged
- [ ] model is loaded once at startup
- [ ] `model.eval()` is used
- [ ] inference uses `torch.no_grad()`
- [ ] uploaded files are validated
- [ ] CORS is configured for the website
- [ ] production server does not use `--reload`
- [ ] HTTPS and appropriate security controls are configured
- [ ] frontend handles API errors and low-confidence predictions
- [ ] real-world images are tested before release

---

# Current Status

- Training: **Complete**
- Model evaluation: **Complete**
- Final test accuracy: **94.74%**
- Model saving: **Complete**
- Class mapping: **Complete**
- Model reload verification: **Complete**
- FastAPI prediction endpoint: **Working**
- End-to-end image prediction: **Working**

