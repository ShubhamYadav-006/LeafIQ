"""Comprehensive model evaluation script for LeafIQ AI Module.

Evaluates trained checkpoint on held-out test set and computes:
- Accuracy, Macro/Weighted Precision, Recall, F1
- Per-class performance breakdown
- Confusion matrix
- Uncertainty / low-confidence distribution
"""

import argparse
import json
import os
import torch
import numpy as np
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report
)

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.model import load_checkpoint
from src.preprocessing import get_inference_transforms


def evaluate_model(
    checkpoint_path: str = "ai/models/leafiq_mobilenet_v3_large_best.pth",
    test_dir: str = "ai/data/processed/test",
    config_path: str = "ai/config/classes.json",
    output_report_path: str = "ai/models/evaluation_report.json",
    batch_size: int = 16,
    device: str = None
):
    """Evaluates the model checkpoint against the held-out test dataset."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"==================================================")
    print(f"LeafIQ AI Held-Out Test Evaluation")
    print(f"Checkpoint: {checkpoint_path}")
    print(f"Device: {device}")
    print(f"==================================================")

    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found at: {checkpoint_path}")

    # Load classes
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    classes_meta = config["classes"]
    class_names = [c["class_name"] for c in classes_meta]

    # Load Model
    model, checkpoint_info = load_checkpoint(checkpoint_path, device=device)
    model.eval()

    # Load Test Data
    if not os.path.exists(test_dir):
        raise FileNotFoundError(f"Test directory not found: {test_dir}")

    test_dataset = ImageFolder(root=test_dir, transform=get_inference_transforms())
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    print(f"Evaluating {len(test_dataset)} held-out test images across {len(test_dataset.classes)} classes...")

    all_preds = []
    all_targets = []
    all_probabilities = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            probs = model.predict_probabilities(images).cpu().numpy()
            preds = np.argmax(probs, axis=1)

            all_preds.extend(preds.tolist())
            all_targets.extend(labels.numpy().tolist())
            all_probabilities.extend(probs.tolist())

    y_true = np.array(all_targets)
    y_pred = np.array(all_preds)
    probs_matrix = np.array(all_probabilities)

    # Core Metrics
    acc = accuracy_score(y_true, y_pred)
    prec_macro, rec_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    prec_weighted, rec_weighted, f1_weighted, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred).tolist()

    # Per-class metrics
    prec_per_cls, rec_per_cls, f1_per_cls, support_per_cls = precision_recall_fscore_support(
        y_true, y_pred, average=None, zero_division=0
    )

    per_class_summary = {}
    for idx, name in enumerate(test_dataset.classes):
        meta = next((c for c in classes_meta if c["class_name"] == name), {})
        per_class_summary[name] = {
            "crop": meta.get("crop", "Unknown"),
            "condition": meta.get("condition", "Unknown"),
            "is_healthy": meta.get("is_healthy", False),
            "precision": round(float(prec_per_cls[idx]), 4),
            "recall": round(float(rec_per_cls[idx]), 4),
            "f1_score": round(float(f1_per_cls[idx]), 4),
            "test_samples": int(support_per_cls[idx])
        }

    # Confidence Distribution Analysis
    max_probs = np.max(probs_matrix, axis=1)
    conf_stats = {
        "mean_confidence": round(float(np.mean(max_probs)), 4),
        "median_confidence": round(float(np.median(max_probs)), 4),
        "min_confidence": round(float(np.min(max_probs)), 4),
        "max_confidence": round(float(np.max(max_probs)), 4),
        "high_confidence_ratio": round(float(np.mean(max_probs >= 0.75)), 4),
        "moderate_confidence_ratio": round(float(np.mean((max_probs >= 0.45) & (max_probs < 0.75))), 4),
        "low_confidence_ratio": round(float(np.mean(max_probs < 0.45)), 4)
    }

    report = {
        "model_checkpoint": checkpoint_path,
        "backbone": checkpoint_info.get("backbone_name", "mobilenet_v3_large"),
        "total_test_samples": len(test_dataset),
        "overall_metrics": {
            "accuracy": round(float(acc), 4),
            "precision_macro": round(float(prec_macro), 4),
            "recall_macro": round(float(rec_macro), 4),
            "f1_macro": round(float(f1_macro), 4),
            "precision_weighted": round(float(prec_weighted), 4),
            "recall_weighted": round(float(rec_weighted), 4),
            "f1_weighted": round(float(f1_weighted), 4)
        },
        "confidence_distribution": conf_stats,
        "per_class_metrics": per_class_summary,
        "confusion_matrix": cm,
        "class_labels": test_dataset.classes
    }

    print("\n--- Held-Out Test Set Performance Summary ---")
    print(f"Accuracy:           {acc * 100:.2f}%")
    print(f"Macro Precision:    {prec_macro * 100:.2f}%")
    print(f"Macro Recall:       {rec_macro * 100:.2f}%")
    print(f"Macro F1-Score:     {f1_macro * 100:.2f}%")
    print(f"Mean Confidence:    {conf_stats['mean_confidence'] * 100:.2f}%")
    print("---------------------------------------------")

    os.makedirs(os.path.dirname(output_report_path), exist_ok=True)
    with open(output_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Saved complete evaluation report to: {output_report_path}")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate LeafIQ Crop Health Classifier")
    parser.add_argument("--checkpoint", default="ai/models/leafiq_mobilenet_v3_large_best.pth", help="Checkpoint path")
    parser.add_argument("--test-dir", default="ai/data/processed/test", help="Test directory path")
    parser.add_argument("--report", default="ai/models/evaluation_report.json", help="Output JSON report path")
    args = parser.parse_args()

    evaluate_model(
        checkpoint_path=args.checkpoint,
        test_dir=args.test_dir,
        output_report_path=args.report
    )
