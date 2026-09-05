"""Training and fine-tuning pipeline for LeafIQ AI Module.

Uses transfer learning with MobileNetV3-Large on the stratified crop-disease dataset.
"""

import argparse
import json
import os
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.model import build_model, save_checkpoint
from src.preprocessing import get_training_transforms, get_inference_transforms


def train_model(
    data_dir: str = "ai/data/processed",
    config_path: str = "ai/config/classes.json",
    output_dir: str = "ai/models",
    backbone_name: str = "mobilenet_v3_large",
    epochs: int = 5,
    batch_size: int = 16,
    learning_rate: float = 1e-4,
    device: str = None
):
    """Trains/fine-tunes the crop health classifier and saves the best model checkpoint."""
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"==================================================")
    print(f"LeafIQ AI Model Training")
    print(f"Backbone: {backbone_name}")
    print(f"Device: {device}")
    print(f"Epochs: {epochs} | Batch Size: {batch_size} | LR: {learning_rate}")
    print(f"==================================================")

    # Load classes
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    class_names = [c["class_name"] for c in config["classes"]]
    num_classes = len(class_names)

    # Datasets and Loaders
    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")

    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        raise FileNotFoundError(f"Processed dataset directories not found in {data_dir}. Run prepare_data.py first.")

    train_dataset = ImageFolder(root=train_dir, transform=get_training_transforms())
    val_dataset = ImageFolder(root=val_dir, transform=get_inference_transforms())

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    print(f"Training samples: {len(train_dataset)} | Validation samples: {len(val_dataset)}")

    # Instantiate model
    model = build_model(
        num_classes=num_classes,
        backbone_name=backbone_name,
        pretrained=True
    ).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    checkpoint_filepath = os.path.join(output_dir, f"leafiq_{backbone_name}_best.pth")

    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
        "training_time_seconds": 0
    }

    start_time = time.time()

    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += (preds == labels).sum().item()
            total_train += labels.size(0)

        scheduler.step()

        epoch_train_loss = train_loss / total_train if total_train > 0 else 0.0
        epoch_train_acc = train_correct / total_train if total_train > 0 else 0.0

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                total_val += labels.size(0)

        epoch_val_loss = val_loss / total_val if total_val > 0 else 0.0
        epoch_val_acc = val_correct / total_val if total_val > 0 else 0.0

        history["train_loss"].append(round(epoch_train_loss, 4))
        history["train_acc"].append(round(epoch_train_acc, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["val_acc"].append(round(epoch_val_acc, 4))

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc * 100:.2f}% | "
            f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc * 100:.2f}%"
        )

        # Save Best Checkpoint
        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            save_checkpoint(
                model=model,
                filepath=checkpoint_filepath,
                class_names=class_names,
                epoch=epoch,
                metrics={"best_val_acc": round(best_val_acc, 4), "val_loss": round(epoch_val_loss, 4)}
            )

    total_time = time.time() - start_time
    history["training_time_seconds"] = round(total_time, 2)
    print(f"Training completed in {total_time:.2f}s. Best Val Accuracy: {best_val_acc * 100:.2f}%.")
    print(f"Saved checkpoint to: {checkpoint_filepath}")

    # Save history
    history_file = os.path.join(output_dir, "training_history.json")
    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    return history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train LeafIQ Crop Health Classifier")
    parser.add_argument("--data-dir", default="ai/data/processed", help="Path to processed data")
    parser.add_argument("--epochs", type=int, default=5, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--backbone", default="mobilenet_v3_large", help="Backbone architecture")
    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        backbone_name=args.backbone
    )
