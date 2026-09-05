# LeafIQ AI Core Module

## 1. AI Architecture Overview

The LeafIQ AI subsystem provides a deterministic, multi-stage crop health inference pipeline designed for integration with the PERN backend:

```text
┌────────────────────────────────────────────────────────┐
│                   Input Leaf Image                     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Stage 1: Image Validation Gate               │
│ • Format & Readability Check (JPEG/PNG/WEBP)           │
│ • Resolution & Extreme Aspect Ratio Guardrail          │
│ • Focus Sharpness via Laplacian Filter Variance        │
│ • Plant Foliage & Vegetation Color Distribution        │
└─────────────┬────────────────────────────┬─────────────┘
              │ (Valid Leaf)               │ (Invalid / Non-plant)
              ▼                            ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│ Stage 2: Preprocessing    │    │ Rejection Response        │
│ • Resize(256)             │    │ status: 'rejected'        │
│ • CenterCrop(224)         │    │ reason: 'Blurry / Nonleaf'│
│ • ImageNet Normalization  │    └───────────────────────────┘
└─────────────┬─────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│         Stage 3: Deep Neural Classifier                │
│ • Backbone: MobileNetV3-Large (Transfer Learning)      │
│ • Custom Head: Linear(512) -> Hardswish -> Dropout(0.3)│
│ • Output: Softmax Probabilities over 14 Classes        │
└─────────────┬──────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────┐
│      Stage 4: Confidence Tiering & Synthesis           │
│ • Top-K Ranking & Uncertainty Calculation              │
│ • Differential Diagnosis Alternatives Detection        │
│ • Pydantic Structured Schema Serialization             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Selected Model & Justification

- **Selected Backbone**: `MobileNetV3-Large` (Pretrained on ImageNet-1K, fine-tuned on crop disease classes)
- **Model Checkpoint**: `ai/models/leafiq_mobilenet_v3_large_best.pth`
- **Why Selected**:
  1. **Low Latency & Fast Inference**: ~15–25ms per image on CPU; <5ms on GPU (RTX 3050).
  2. **Compact Deployment Size**: <25MB disk footprint, ideal for scalable cloud or local node services.
  3. **High Discriminative Accuracy**: Advanced inverted residual blocks with Squeeze-and-Excitation (SE) attention layers capture fine-grained foliar disease textures.
  4. **Direct Probability Output**: Calibrated Softmax outputs enable uncertainty bounds and alternative differential diagnoses.

---

## 3. Dataset & Supported Class Scope

The MVP classification engine supports **14 distinct classes** across the Solanaceae family:

| Crop | Condition | Scientific Pathogen / Agent | Default Concern Level |
|---|---|---|---|
| **Tomato** | Bacterial Spot | *Xanthomonas campestris pv. vesicatoria* | Attention |
| **Tomato** | Early Blight | *Alternaria solani* | Attention |
| **Tomato** | Late Blight | *Phytophthora infestans* | High Concern |
| **Tomato** | Leaf Mold | *Passalora fulva* | Monitor |
| **Tomato** | Septoria Leaf Spot | *Septoria lycopersici* | Attention |
| **Tomato** | Spider Mites Damage | *Tetranychus urticae* | Attention |
| **Tomato** | Target Spot | *Corynespora cassiicola* | Attention |
| **Tomato** | Yellow Leaf Curl Virus | *Begomovirus (Whitefly-transmitted)* | High Concern |
| **Tomato** | Healthy Foliage | N/A | Healthy |
| **Potato** | Early Blight | *Alternaria solani* | Attention |
| **Potato** | Late Blight | *Phytophthora infestans* | High Concern |
| **Potato** | Healthy Foliage | N/A | Healthy |
| **Pepper (Bell)** | Bacterial Spot | *Xanthomonas campestris* | Attention |
| **Pepper (Bell)** | Healthy Foliage | N/A | Healthy |

---

## 4. Installation & Environment Setup

```bash
# 1. Install dependencies
pip install -r ai/requirements.txt
```

---

## 5. Training & Evaluation Pipeline

```bash
# Step 1: Prepare and partition dataset (70% train, 15% val, 15% test)
python ai/scripts/prepare_data.py --raw-dir ai/data/raw --output-dir ai/data/processed

# Step 2: Train / Fine-tune the classifier
python ai/scripts/train.py --epochs 5 --batch-size 16 --lr 1e-4

# Step 3: Run comprehensive evaluation on held-out test set
python ai/scripts/evaluate.py --checkpoint ai/models/leafiq_mobilenet_v3_large_best.pth
```

---

## 6. Inference CLI & Programmatic Usage

### CLI Execution
```bash
python ai/scripts/predict.py --image path/to/leaf.jpg
```

### Programmatic Python Interface
```python
from ai.src import LeafIQInferenceEngine

engine = LeafIQInferenceEngine(checkpoint_path="ai/models/leafiq_mobilenet_v3_large_best.pth")
result = engine.predict("path/to/leaf.jpg")

print("Status:", result.status)
print("Crop:", result.crop.name, f"({result.crop.confidence * 100:.1f}%)")
print("Assessment:", result.assessment.condition, f"({result.assessment.confidence * 100:.1f}%)")
print("Concern Level:", result.assessment.concern_level)
```

---

## 7. Structured JSON Output Contract

### Successful Prediction
```json
{
  "status": "success",
  "image_valid": true,
  "supported": true,
  "crop": {
    "name": "Tomato",
    "confidence": 0.92
  },
  "assessment": {
    "condition": "Early Blight",
    "pathogen": "Alternaria solani",
    "is_healthy": false,
    "confidence": 0.87,
    "concern_level": "attention",
    "confidence_tier": "high"
  },
  "alternatives": [
    {
      "crop": "Tomato",
      "condition": "Septoria Leaf Spot",
      "pathogen": "Septoria lycopersici",
      "confidence": 0.11,
      "rationale": "Shows secondary visual similarity (11.0% probability)."
    }
  ],
  "model": {
    "name": "LeafIQ-Classifier",
    "version": "1.0.0",
    "architecture": "mobilenet_v3_large",
    "checkpoint": "leafiq_mobilenet_v3_large_best.pth"
  }
}
```

### Rejected / Invalid Image
```json
{
  "status": "rejected",
  "image_valid": false,
  "supported": false,
  "validation": {
    "is_valid": false,
    "reason": "No recognizable crop foliage or plant tissue detected in the photo.",
    "metrics": {
      "blur_score": 54.2,
      "vegetation_ratio": 0.02
    }
  },
  "reason": "No recognizable crop foliage or plant tissue detected in the photo.",
  "message": "Please upload a clearer leaf image."
}
```

---

## 8. Limitations & Real-World Domain Gap

1. **Controlled Background Bias**: The base training images contain uniform backgrounds. In-field photos with complex weed backgrounds may exhibit lower confidence, which LeafIQ mitigates through follow-up farmer questioning.
2. **Scope Boundaries**: Unsupported crops (e.g., Apple, Wheat) will be flagged as low-confidence/inconclusive.
3. **Safety Notice**: All predictions represent AI-assisted decision support and must not be interpreted as certified laboratory diagnoses.

---

## 9. Integration Point with Express.js Backend

The Express backend can invoke inference via:
1. Direct child process execution (`python ai/scripts/predict.py --image <filepath>`).
2. A lightweight internal HTTP microservice running FastAPI/Uvicorn on `localhost:8000/predict`.
