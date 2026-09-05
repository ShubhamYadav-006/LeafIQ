"""Preprocessing and augmentation pipeline for LeafIQ AI.

Provides standard PyTorch torchvision transforms for training, evaluation,
and production inference.
"""

from typing import Union
from PIL import Image
import torch
import torchvision.transforms as transforms

# Standard ImageNet statistics (compatible with MobileNet, ResNet, EfficientNet backbones)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
IMAGE_SIZE = 224


def get_inference_transforms() -> transforms.Compose:
    """Returns standard deterministic transform pipeline for validation and inference."""
    return transforms.Compose([
        transforms.Resize(256, interpolation=transforms.InterpolationMode.BILINEAR),
        transforms.CenterCrop(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])


def get_training_transforms() -> transforms.Compose:
    """Returns augmented transform pipeline for model training/fine-tuning."""
    return transforms.Compose([
        transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.75, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])


def preprocess_image(image_input: Union[str, Image.Image]) -> torch.Tensor:
    """Loads and preprocesses a single image into a 4D batch tensor (1, 3, 224, 224)."""
    if isinstance(image_input, str):
        with Image.open(image_input) as img:
            img_rgb = img.convert("RGB")
            transform = get_inference_transforms()
            tensor = transform(img_rgb)
    elif isinstance(image_input, Image.Image):
        img_rgb = image_input.convert("RGB")
        transform = get_inference_transforms()
        tensor = transform(img_rgb)
    else:
        raise TypeError(f"Expected str path or PIL.Image.Image, got {type(image_input)}")

    return tensor.unsqueeze(0)  # Add batch dimension
