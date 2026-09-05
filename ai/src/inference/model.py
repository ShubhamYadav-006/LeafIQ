"""Model definition and architecture factory for LeafIQ AI.

Supports transfer learning with MobileNetV3-Large, ResNet, and EfficientNet backbones.
"""

import os
import torch
import torch.nn as nn
from torchvision import models


class LeafIQClassifier(nn.Module):
    """Deep neural network classifier for crop identification and disease diagnosis.

    Uses a pretrained backbone with a custom multi-layer classification head.
    """

    def __init__(
        self,
        num_classes: int = 14,
        backbone_name: str = "mobilenet_v3_large",
        pretrained: bool = True,
        dropout_rate: float = 0.3
    ):
        super().__init__()
        self.backbone_name = backbone_name
        self.num_classes = num_classes

        if backbone_name == "mobilenet_v3_large":
            weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
            self.backbone = models.mobilenet_v3_large(weights=weights)
            in_features = self.backbone.classifier[0].in_features
            # Replace classifier head
            self.backbone.classifier = nn.Sequential(
                nn.Linear(in_features, 512),
                nn.Hardswish(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(512, num_classes)
            )
        elif backbone_name == "resnet50":
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            self.backbone = models.resnet50(weights=weights)
            in_features = self.backbone.fc.in_features
            self.backbone.fc = nn.Sequential(
                nn.Dropout(p=dropout_rate),
                nn.Linear(in_features, 512),
                nn.ReLU(),
                nn.Dropout(p=dropout_rate),
                nn.Linear(512, num_classes)
            )
        elif backbone_name == "efficientnet_b0":
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            self.backbone = models.efficientnet_b0(weights=weights)
            in_features = self.backbone.classifier[1].in_features
            self.backbone.classifier = nn.Sequential(
                nn.Dropout(p=dropout_rate),
                nn.Linear(in_features, num_classes)
            )
        else:
            raise ValueError(f"Unsupported backbone: {backbone_name}")

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass emitting raw unnormalized logits."""
        return self.backbone(x)

    def predict_probabilities(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass with Softmax activation emitting class probabilities (0.0 to 1.0)."""
        logits = self.forward(x)
        return torch.softmax(logits, dim=1)


def build_model(
    num_classes: int = 14,
    backbone_name: str = "mobilenet_v3_large",
    pretrained: bool = True
) -> LeafIQClassifier:
    """Builds and returns a LeafIQClassifier model instance."""
    return LeafIQClassifier(
        num_classes=num_classes,
        backbone_name=backbone_name,
        pretrained=pretrained
    )


def save_checkpoint(
    model: LeafIQClassifier,
    filepath: str,
    class_names: list,
    epoch: int = 0,
    metrics: dict = None
) -> None:
    """Saves model weights, class mappings, and metadata to disk."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    state = {
        "state_dict": model.state_dict(),
        "backbone_name": model.backbone_name,
        "num_classes": model.num_classes,
        "class_names": class_names,
        "epoch": epoch,
        "metrics": metrics or {},
        "version": "1.0.0"
    }
    torch.save(state, filepath)


def load_checkpoint(filepath: str, device: str = "cpu") -> tuple[LeafIQClassifier, dict]:
    """Loads a saved checkpoint and returns the instantiated model + metadata dict."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Checkpoint file not found: {filepath}")

    checkpoint = torch.load(filepath, map_location=device, weights_only=False)
    model = LeafIQClassifier(
        num_classes=checkpoint.get("num_classes", 14),
        backbone_name=checkpoint.get("backbone_name", "mobilenet_v3_large"),
        pretrained=False
    )
    model.load_state_dict(checkpoint["state_dict"])
    model.to(device)
    model.eval()
    return model, checkpoint
