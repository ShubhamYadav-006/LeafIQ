"""Image validation module for LeafIQ AI.

Performs deterministic first-level technical and physical image validation:
1. File format & readable header check
2. File integrity / corruption check
3. Minimum resolution & aspect ratio check
4. Sharpness / Blur estimation (Laplacian variance)
5. Foliage / Vegetation presence estimation
"""

import os
from typing import Tuple, Dict, Any
from PIL import Image, ImageOps, ImageFilter
import numpy as np


class ImageValidator:
    """Validates leaf images prior to running neural network inference."""

    ALLOWED_FORMATS = {"JPEG", "JPG", "PNG", "WEBP"}
    MIN_DIMENSION = 64
    RECOMMENDED_MIN_DIMENSION = 180
    MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15MB
    MIN_BLUR_SCORE = 35.0                    # Laplacian variance threshold
    MIN_VEGETATION_RATIO = 0.08              # Minimum % of foliage/green/yellow-brown tones

    @classmethod
    def validate_image_path(cls, image_path: str) -> Tuple[bool, str, Dict[str, Any]]:
        """Validates an image from a local file path.

        Returns:
            Tuple of (is_valid: bool, reason: str, metrics: Dict[str, Any])
        """
        if not os.path.exists(image_path):
            return False, f"Image file not found: {image_path}", {}

        # Check file size
        file_size = os.path.getsize(image_path)
        if file_size == 0:
            return False, "Image file is empty (0 bytes).", {"file_size": 0}
        if file_size > cls.MAX_FILE_SIZE_BYTES:
            return False, f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum limit of 15MB.", {"file_size": file_size}

        try:
            with Image.open(image_path) as img:
                # 1. Format check
                img_format = (img.format or "").upper()
                if img_format not in cls.ALLOWED_FORMATS:
                    return False, f"Unsupported image format: '{img_format}'. Supported formats: JPG, PNG, WEBP.", {"format": img_format}

                # 2. Dimensions check
                width, height = img.size
                if width < cls.MIN_DIMENSION or height < cls.MIN_DIMENSION:
                    return False, f"Image resolution ({width}x{height}) is too low. Minimum required: {cls.MIN_DIMENSION}x{cls.MIN_DIMENSION}px.", {
                        "width": width,
                        "height": height
                    }

                aspect_ratio = max(width, height) / max(1, min(width, height))
                if aspect_ratio > 4.5:
                    return False, f"Extreme aspect ratio ({aspect_ratio:.1f}:1). Please capture a centered photo of the leaf.", {
                        "width": width,
                        "height": height,
                        "aspect_ratio": aspect_ratio
                    }

                # 3. Read image pixels and check for corruption
                img_rgb = img.convert("RGB")
                img_rgb.load()

                # 4. Blur / Sharpness check using Laplacian variance
                blur_score = cls._compute_sharpness(img_rgb)
                
                # 5. Vegetation / Foliage color ratio check
                vegetation_ratio = cls._compute_vegetation_ratio(img_rgb)

                metrics = {
                    "format": img_format,
                    "width": width,
                    "height": height,
                    "file_size_bytes": file_size,
                    "blur_score": round(blur_score, 2),
                    "vegetation_ratio": round(vegetation_ratio, 3),
                }

                # Evaluation criteria
                if blur_score < cls.MIN_BLUR_SCORE:
                    return False, "Photo appears severely blurry or out of focus. Please capture a steady, well-lit photo.", metrics

                if vegetation_ratio < cls.MIN_VEGETATION_RATIO:
                    return False, "No recognizable crop foliage or plant tissue detected in the photo. Please upload a clear photo of a crop leaf.", metrics

                return True, "Image passed technical validation.", metrics

        except Exception as e:
            return False, f"Corrupted or unreadable image file: {str(e)}", {}

    @staticmethod
    def _compute_sharpness(img_rgb: Image.Image) -> float:
        """Computes focus sharpness via discrete Laplacian filter variance."""
        gray = ImageOps.grayscale(img_rgb)
        # Downscale for fast and consistent blur evaluation
        gray = gray.resize((256, 256), Image.Resampling.BILINEAR)
        gray_arr = np.array(gray, dtype=np.float64)

        # 3x3 Discrete Laplacian kernel
        laplacian_kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float64)
        
        # Convolve using NumPy slicing
        conv = (
            laplacian_kernel[0, 1] * gray_arr[:-2, 1:-1] +
            laplacian_kernel[1, 0] * gray_arr[1:-1, :-2] +
            laplacian_kernel[1, 1] * gray_arr[1:-1, 1:-1] +
            laplacian_kernel[1, 2] * gray_arr[1:-1, 2:] +
            laplacian_kernel[2, 1] * gray_arr[2:, 1:-1]
        )
        return float(np.var(conv))

    @staticmethod
    def _compute_vegetation_ratio(img_rgb: Image.Image) -> float:
        """Estimates the proportion of pixels corresponding to plant foliage

        (green, yellow-green, brown, necrotic blight hues).
        """
        img_small = img_rgb.resize((128, 128), Image.Resampling.BILINEAR)
        arr = np.array(img_small, dtype=np.float32)
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

        # Excess Green Index (ExG = 2*G - R - B) and plant color criteria
        # Captures both healthy green foliage and diseased chlorotic/brownish leaf areas
        is_green = (g > r * 0.9) & (g > b * 1.05) & (g > 30)
        is_chlorotic_yellow = (r > 70) & (g > 70) & (b < 90) & (abs(r - g) < 40)
        is_necrotic_brown = (r > 50) & (g > 30) & (b < 50) & (r > g) & (g > b)

        plant_mask = is_green | is_chlorotic_yellow | is_necrotic_brown
        return float(np.mean(plant_mask))
