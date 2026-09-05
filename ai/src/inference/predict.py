"""CLI and programmatic inference script for LeafIQ AI.

Usage:
    python ai/scripts/predict.py --image path/to/leaf.jpg
    python ai/scripts/predict.py --image path/to/leaf.jpg --checkpoint ai/models/leafiq_mobilenet_v3_large_best.pth
"""

import argparse
import json
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

try:
    from .inference import LeafIQInferenceEngine
except (ImportError, ValueError):
    from ai.src.inference.inference import LeafIQInferenceEngine


def main():
    parser = argparse.ArgumentParser(description="Run LeafIQ Crop Health Inference on a Leaf Image")
    parser.add_argument("--image", required=True, help="Path to leaf image file")
    parser.add_argument("--checkpoint", default=None, help="Optional path to model checkpoint (.pth)")
    parser.add_argument("--config", default="ai/config/classes.json", help="Path to classes.json")
    parser.add_argument("--top-k", type=int, default=3, help="Number of top predictions to calculate")
    parser.add_argument("--device", default=None, help="Device: cuda or cpu")
    args = parser.parse_args()

    # If checkpoint not specified, look for default saved model
    checkpoint = args.checkpoint
    if checkpoint is None:
        default_ckpt = "ai/models/leafiq_mobilenet_v3_large_best.pth"
        if os.path.exists(default_ckpt):
            checkpoint = default_ckpt

    # Run inference
    engine = LeafIQInferenceEngine(
        checkpoint_path=checkpoint,
        config_path=args.config,
        device=args.device
    )

    result = engine.predict(image_path=args.image, top_k=args.top_k)

    # Print clean machine-readable JSON to stdout
    print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
