# LeafIQ AI Dataset Specification & Documentation

## 1. Dataset Overview

For the LeafIQ MVP, we focus strictly on a high-confidence, well-annotated subset of the benchmark **PlantVillage** dataset (Hughes & Salathé, 2015) covering the **Solanaceae family** (Tomato, Potato, and Pepper Bell).

### Selected Scope (14 Classes)
1. **Tomato**:
   - `Tomato___Bacterial_spot`
   - `Tomato___Early_blight`
   - `Tomato___Late_blight`
   - `Tomato___Leaf_Mold`
   - `Tomato___Septoria_leaf_spot`
   - `Tomato___Spider_mites_Two-spotted_spider_mite`
   - `Tomato___Target_Spot`
   - `Tomato___Yellow_Leaf_Curl_Virus`
   - `Tomato___healthy`
2. **Potato**:
   - `Potato___Early_blight`
   - `Potato___Late_blight`
   - `Potato___healthy`
3. **Pepper (Bell)**:
   - `Pepper__bell___Bacterial_spot`
   - `Pepper__bell___healthy`

---

## 2. Dataset Licensing & Provenance
- **Source**: PlantVillage open-access crop disease image repository.
- **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) / Public Academic Research.
- **Citation**: Hughes, D., & Salathé, M. (2015). An open access repository of images on plant health to enable the development of mobile disease diagnostics. *arXiv preprint arXiv:1511.08060*.

---

## 3. Data Splitting & Leakage Prevention
- **Split Ratio**:
  - **Train**: 70% (Used for training with augmentation)
  - **Validation**: 15% (Used for early stopping and hyperparameter tuning)
  - **Test**: 15% (Held-out evaluation set, never touched during training)
- **Stratified Partitioning**: The split is performed per-class to maintain identical class balance across train, val, and test subsets.
- **Deduplication**: Exact duplicate hashes are filtered during preparation to avoid data leakage between splits.

---

## 4. Real-World Limitations & Laboratory Domain Gap

> [!WARNING]
> **Controlled Background vs. In-Field Reality**:
> The PlantVillage dataset was primarily captured in controlled laboratory settings (single leaves placed on uniform grey/black backgrounds). In real agricultural conditions, farmer photos feature natural soil, shadows, overlapping leaves, variable sunlight, and insect debris.
> 
> **LeafIQ Mitigation Strategy**:
> 1. We apply heavy photometric and geometric augmentations (random cropping, rotations, color jitter) during training.
> 2. We implement a dedicated **Image Validation Layer** to catch blurry/unfocused images early.
> 3. We pair vision predictions with **Smart Follow-up Questions** (farmer observations) to compensate for visual domain shifts.
