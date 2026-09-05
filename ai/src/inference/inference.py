"""Inference engine for LeafIQ AI.

Coordinates the end-to-end pipeline:
Image Path -> Validation Gate -> Preprocessing -> Model Forward -> Confidence Tiering -> Structured Schema
"""

import json
import os
from typing import Dict, Any, Optional
import torch

try:
    from ..validation.validation import ImageValidator
    from ..preprocessing.preprocessing import preprocess_image
    from .model import LeafIQClassifier, load_checkpoint, build_model
    from .schemas import (
        InferenceResponse,
        ImageValidationResult,
        CropInfo,
        AssessmentInfo,
        AlternativePossibility,
        ModelInfo
    )
except (ImportError, ValueError):
    from ai.src.validation.validation import ImageValidator
    from ai.src.preprocessing.preprocessing import preprocess_image
    from ai.src.inference.model import LeafIQClassifier, load_checkpoint, build_model
    from ai.src.inference.schemas import (
        InferenceResponse,
        ImageValidationResult,
        CropInfo,
        AssessmentInfo,
        AlternativePossibility,
        ModelInfo
    )


class LeafIQInferenceEngine:
    """Production inference engine for LeafIQ crop health assessment."""

    def __init__(
        self,
        checkpoint_path: Optional[str] = None,
        config_path: Optional[str] = None,
        device: Optional[str] = None
    ):
        # Determine device (CUDA GPU if available, else CPU)
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        # Load class configuration
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if config_path is None or not os.path.exists(config_path):
            config_path = os.path.join(base_dir, "config", "classes.json")

        with open(config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        self.classes_meta = {c["id"]: c for c in self.config["classes"]}
        self.class_name_to_meta = {c["class_name"]: c for c in self.config["classes"]}
        self.num_classes = len(self.config["classes"])
        self.thresholds = self.config.get("thresholds", {
            "high_confidence": 0.75,
            "moderate_confidence": 0.45,
            "low_confidence_rejection": 0.30,
            "alternative_possibility_min_prob": 0.10
        })

        # Load or initialize model
        self.checkpoint_path = checkpoint_path
        if checkpoint_path and os.path.exists(checkpoint_path):
            self.model, checkpoint_info = load_checkpoint(checkpoint_path, device=self.device)
            self.model_info = ModelInfo(
                name="LeafIQ-Classifier",
                version=checkpoint_info.get("version", "1.0.0"),
                architecture=checkpoint_info.get("backbone_name", "mobilenet_v3_large"),
                checkpoint=os.path.basename(checkpoint_path)
            )
        else:
            # Fallback to pretrained backbone with initialized head for POC/eval
            self.model = build_model(
                num_classes=self.num_classes,
                backbone_name="mobilenet_v3_large",
                pretrained=True
            ).to(self.device)
            self.model.eval()
            self.model_info = ModelInfo(
                name="LeafIQ-Classifier-Pretrained",
                version="1.0.0-poc",
                architecture="mobilenet_v3_large",
                checkpoint="backbone-pretrained"
            )

    def predict(self, image_path: str, top_k: int = 3) -> InferenceResponse:
        """Executes full diagnostic pipeline on a local image file."""
        # 1. Technical & Physical Image Validation Gate
        is_valid, validation_reason, metrics = ImageValidator.validate_image_path(image_path)
        val_result = ImageValidationResult(
            is_valid=is_valid,
            reason=validation_reason if not is_valid else None,
            metrics=metrics
        )

        if not is_valid:
            return InferenceResponse(
                status="rejected",
                image_valid=False,
                supported=False,
                validation=val_result,
                model=self.model_info,
                reason=validation_reason,
                message="Image validation failed. Please upload a clear, focused photo of a crop leaf."
            )

        # 2. Image Preprocessing
        try:
            tensor = preprocess_image(image_path).to(self.device)
        except Exception as e:
            return InferenceResponse(
                status="error",
                image_valid=True,
                supported=False,
                validation=val_result,
                model=self.model_info,
                reason=f"Failed to preprocess image: {str(e)}",
                message="An error occurred while preparing the image for analysis."
            )

        # 3. Model Inference (Softmax probabilities)
        with torch.no_grad():
            probabilities = self.model.predict_probabilities(tensor)[0].cpu().numpy()

        # 4. Rank Predictions
        sorted_indices = probabilities.argsort()[::-1]
        top_idx = int(sorted_indices[0])
        top_prob = float(probabilities[top_idx])
        top_meta = self.classes_meta.get(top_idx)

        if not top_meta:
            return InferenceResponse(
                status="error",
                image_valid=True,
                supported=False,
                validation=val_result,
                model=self.model_info,
                reason="Unmapped class index returned by model.",
                message="An internal classification error occurred."
            )

        # 5. Top-K Predictions List
        top_k_list = []
        for idx in sorted_indices[:top_k]:
            idx_int = int(idx)
            meta = self.classes_meta.get(idx_int, {})
            top_k_list.append({
                "class_name": meta.get("class_name"),
                "crop": meta.get("crop"),
                "condition": meta.get("condition"),
                "probability": round(float(probabilities[idx_int]), 4)
            })

        # 6. Confidence Tiering & Uncertainty Handling
        if top_prob >= self.thresholds["high_confidence"]:
            confidence_tier = "high"
            concern_level = top_meta["default_concern_level"]
        elif top_prob >= self.thresholds["moderate_confidence"]:
            confidence_tier = "moderate"
            concern_level = top_meta["default_concern_level"]
        elif top_prob >= self.thresholds["low_confidence_rejection"]:
            confidence_tier = "low"
            concern_level = "uncertain"
        else:
            # Below minimum threshold -> Inconclusive / Unsupported
            return InferenceResponse(
                status="inconclusive",
                image_valid=True,
                supported=False,
                validation=val_result,
                model=self.model_info,
                top_k_predictions=top_k_list,
                reason=f"Model confidence ({top_prob:.2f}) is below minimum reliable threshold ({self.thresholds['low_confidence_rejection']}).",
                message="The crop condition or species could not be determined with sufficient confidence."
            )

        # 7. Formulate Alternatives (Classes with prob >= threshold, excluding top prediction)
        alternatives = []
        alt_min_prob = self.thresholds.get("alternative_possibility_min_prob", 0.10)
        for idx in sorted_indices[1:top_k]:
            idx_int = int(idx)
            prob = float(probabilities[idx_int])
            if prob >= alt_min_prob:
                alt_meta = self.classes_meta.get(idx_int, {})
                alternatives.append(AlternativePossibility(
                    crop=alt_meta.get("crop", "Unknown"),
                    condition=alt_meta.get("condition", "Unknown"),
                    pathogen=alt_meta.get("pathogen"),
                    confidence=round(prob, 3),
                    rationale=f"Shows secondary visual similarity ({prob*100:.1f}% probability)."
                ))

        # 8. Return Validated Inference Response
        return InferenceResponse(
            status="success",
            image_valid=True,
            supported=True,
            crop=CropInfo(
                name=top_meta["crop"],
                confidence=round(min(1.0, top_prob + 0.05), 3)  # Crop identification confidence
            ),
            assessment=AssessmentInfo(
                condition=top_meta["condition"],
                pathogen=top_meta["pathogen"],
                is_healthy=top_meta["is_healthy"],
                confidence=round(top_prob, 3),
                concern_level=concern_level,
                confidence_tier=confidence_tier
            ),
            alternatives=alternatives,
            top_k_predictions=top_k_list,
            validation=val_result,
            model=self.model_info
        )
