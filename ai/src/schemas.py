"""Pydantic schemas for LeafIQ AI module.

Enforces strictly typed and deterministic input/output contracts.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ImageValidationResult(BaseModel):
    """Result of first-level technical and physical image validation."""
    is_valid: bool = Field(..., description="Whether the image meets quality & foliage requirements")
    reason: Optional[str] = Field(None, description="Reason for rejection if image is invalid")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Diagnostic metrics (dimensions, blur score, green ratio)")


class CropInfo(BaseModel):
    """Identified crop information."""
    name: str = Field(..., description="Common crop name (e.g. Tomato, Potato, Pepper)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in crop identification (0.0 to 1.0)")


class AssessmentInfo(BaseModel):
    """Predicted condition and health assessment."""
    condition: str = Field(..., description="Condition or disease name")
    pathogen: Optional[str] = Field(None, description="Scientific pathogen name if applicable")
    is_healthy: bool = Field(..., description="Whether the plant is assessed as healthy")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model probability for this condition (0.0 to 1.0)")
    concern_level: str = Field(..., description="Assigned concern level: healthy | monitor | attention | high_concern | uncertain")
    confidence_tier: str = Field(..., description="Categorical confidence: high | moderate | low | inconclusive")


class AlternativePossibility(BaseModel):
    """Differential diagnostic alternative when uncertainty exists."""
    crop: str
    condition: str
    pathogen: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    rationale: str


class ModelInfo(BaseModel):
    """Metadata describing the AI model used for prediction."""
    name: str
    version: str
    architecture: str
    checkpoint: str


class InferenceResponse(BaseModel):
    """Final unified structured prediction response from the AI core."""
    status: str = Field(..., description="'success' | 'rejected' | 'inconclusive' | 'error'")
    image_valid: bool
    supported: bool
    crop: Optional[CropInfo] = None
    assessment: Optional[AssessmentInfo] = None
    alternatives: List[AlternativePossibility] = Field(default_factory=list)
    top_k_predictions: List[Dict[str, Any]] = Field(default_factory=list)
    validation: Optional[ImageValidationResult] = None
    model: Optional[ModelInfo] = None
    reason: Optional[str] = None
    message: Optional[str] = None
