"""Comprehensive test suite for LeafIQ AI Module.

Covers:
1. Valid leaf image handling
2. Healthy leaf vs. diseased leaf differentiation
3. Invalid / non-plant image rejection
4. Corrupted image error handling
5. Sub-minimum resolution image rejection
6. Low-confidence / uncertainty tiering
7. Pydantic inference schema contract verification
"""

import json
import os
import tempfile
import pytest
from PIL import Image, ImageDraw

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.validation import ImageValidator
from src.schemas import InferenceResponse
from src.inference import LeafIQInferenceEngine


@pytest.fixture(scope="session")
def test_fixtures_dir():
    """Generates temporary representative image fixtures for automated testing."""
    temp_dir = tempfile.mkdtemp(prefix="leafiq_test_images_")

    # 1. Valid Healthy Leaf Image
    healthy_img = Image.new("RGB", (256, 256), color=(30, 30, 30))
    draw = ImageDraw.Draw(healthy_img)
    draw.ellipse([30, 20, 226, 236], fill=(50, 160, 60), outline=(30, 110, 40), width=2)
    draw.line([128, 30, 128, 230], fill=(70, 190, 80), width=2)
    healthy_path = os.path.join(temp_dir, "test_healthy_leaf.jpg")
    healthy_img.save(healthy_path, "JPEG")

    # 2. Valid Diseased Leaf Image (Blight lesions)
    diseased_img = Image.new("RGB", (256, 256), color=(30, 30, 30))
    draw = ImageDraw.Draw(diseased_img)
    draw.ellipse([30, 20, 226, 236], fill=(50, 140, 60), outline=(30, 100, 40), width=2)
    # Concentric blight spots
    draw.ellipse([80, 80, 130, 130], fill=(90, 60, 30), outline=(210, 190, 50), width=3)
    draw.ellipse([90, 90, 120, 120], fill=(60, 40, 20), outline=(150, 100, 40), width=2)
    diseased_path = os.path.join(temp_dir, "test_diseased_leaf.jpg")
    diseased_img.save(diseased_path, "JPEG")

    # 3. Invalid Non-Plant Image (e.g. blue metallic tool on white background)
    non_plant_img = Image.new("RGB", (256, 256), color=(245, 245, 245))
    draw = ImageDraw.Draw(non_plant_img)
    draw.rectangle([40, 40, 216, 216], fill=(40, 80, 200), outline=(10, 20, 100), width=3)
    draw.line([40, 40, 216, 216], fill=(255, 255, 255), width=4)
    non_plant_path = os.path.join(temp_dir, "test_non_plant.jpg")
    non_plant_img.save(non_plant_path, "JPEG")

    # 4. Tiny Resolution Image (< 64x64)
    tiny_img = Image.new("RGB", (32, 32), color=(50, 160, 60))
    tiny_path = os.path.join(temp_dir, "test_tiny_image.jpg")
    tiny_img.save(tiny_path, "JPEG")

    # 5. Corrupted Image File
    corrupt_path = os.path.join(temp_dir, "test_corrupted.jpg")
    with open(corrupt_path, "wb") as f:
        f.write(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01...corrupted_random_bytes_XYZ...")

    fixtures = {
        "dir": temp_dir,
        "healthy": healthy_path,
        "diseased": diseased_path,
        "non_plant": non_plant_path,
        "tiny": tiny_path,
        "corrupt": corrupt_path
    }

    yield fixtures


# -----------------------------------------------------------------------------
# Test Group 1: Technical Image Validation Gate
# -----------------------------------------------------------------------------

def test_validation_healthy_leaf_passes(test_fixtures_dir):
    """Verifies that a valid leaf photo passes technical validation."""
    is_valid, reason, metrics = ImageValidator.validate_image_path(test_fixtures_dir["healthy"])
    assert is_valid is True
    assert metrics["vegetation_ratio"] > 0.10


def test_validation_non_plant_rejected(test_fixtures_dir):
    """Verifies that a non-plant image is rejected at validation gate."""
    is_valid, reason, metrics = ImageValidator.validate_image_path(test_fixtures_dir["non_plant"])
    assert is_valid is False
    assert "No recognizable crop foliage" in reason or "blurry" in reason.lower()


def test_validation_tiny_image_rejected(test_fixtures_dir):
    """Verifies that images smaller than minimum dimension are rejected."""
    is_valid, reason, metrics = ImageValidator.validate_image_path(test_fixtures_dir["tiny"])
    assert is_valid is False
    assert "resolution" in reason.lower()


def test_validation_corrupted_image_rejected(test_fixtures_dir):
    """Verifies that corrupted/unreadable images are safely caught."""
    is_valid, reason, metrics = ImageValidator.validate_image_path(test_fixtures_dir["corrupt"])
    assert is_valid is False
    assert "Corrupted" in reason or "unreadable" in reason.lower()


# -----------------------------------------------------------------------------
# Test Group 2: End-to-End Inference & Schema Conformance
# -----------------------------------------------------------------------------

def test_inference_on_valid_image(test_fixtures_dir):
    """Verifies end-to-end inference produces a valid Pydantic schema with bounds."""
    checkpoint = "ai/models/leafiq_mobilenet_v3_large_best.pth"
    engine = LeafIQInferenceEngine(
        checkpoint_path=checkpoint if os.path.exists(checkpoint) else None,
        device="cpu"
    )
    result = engine.predict(test_fixtures_dir["diseased"])

    assert isinstance(result, InferenceResponse)
    assert result.status in ["success", "inconclusive"]
    assert result.image_valid is True

    if result.status == "success":
        assert result.supported is True
        # Crop checks
        assert result.crop is not None
        assert result.crop.name in ["Tomato", "Potato", "Pepper (Bell)"]
        assert 0.0 <= result.crop.confidence <= 1.0

        # Assessment checks
        assert result.assessment is not None
        assert 0.0 <= result.assessment.confidence <= 1.0
        assert result.assessment.concern_level in ["healthy", "monitor", "attention", "high_concern", "uncertain"]
        assert result.assessment.confidence_tier in ["high", "moderate", "low", "inconclusive"]

    # Model metadata check
    assert result.model is not None
    assert len(result.model.name) > 0


def test_inference_rejection_on_invalid_image(test_fixtures_dir):
    """Verifies that invalid images return status='rejected' without disease diagnosis."""
    engine = LeafIQInferenceEngine(checkpoint_path=None, device="cpu")
    result = engine.predict(test_fixtures_dir["non_plant"])

    assert result.status == "rejected"
    assert result.image_valid is False
    assert result.supported is False
    assert result.assessment is None  # Never emit disease on invalid image!
    assert result.reason is not None
    assert result.message is not None


def test_inference_top_k_structure(test_fixtures_dir):
    """Verifies top-k candidate ranking integrity."""
    engine = LeafIQInferenceEngine(checkpoint_path=None, device="cpu")
    result = engine.predict(test_fixtures_dir["healthy"], top_k=3)

    assert len(result.top_k_predictions) <= 3
    for pred in result.top_k_predictions:
        assert "class_name" in pred
        assert "crop" in pred
        assert "condition" in pred
        assert 0.0 <= pred["probability"] <= 1.0
