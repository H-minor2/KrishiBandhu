"""
model.py
Creates a MobileNetV3 Large transfer learning model for
31 plant disease classes.
"""

import torch.nn as nn

from torchvision.models import (
    mobilenet_v3_large,
    MobileNet_V3_Large_Weights
)


NUM_CLASSES = 31


# --------------------------------------------------
# 1. Load MobileNetV3 Large with pretrained weights
# --------------------------------------------------

weights = MobileNet_V3_Large_Weights.DEFAULT

model = mobilenet_v3_large(weights=weights)


# --------------------------------------------------
# 2. Freeze pretrained feature extraction layers
# --------------------------------------------------

for param in model.features.parameters():
    param.requires_grad = False


# --------------------------------------------------
# 3. Replace final classification layer
# --------------------------------------------------

num_features = model.classifier[-1].in_features

model.classifier[-1] = nn.Linear(
    num_features,
    NUM_CLASSES
)


if __name__ == "__main__":

    print("MobileNetV3 Large transfer learning model created.")
    print(f"Number of output classes: {NUM_CLASSES}")
    print(f"Final layer: {model.classifier[-1]}")