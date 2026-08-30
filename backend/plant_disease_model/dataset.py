"""
dataset.py
Defines the data augmentation and normalization transforms
for the plant disease detection model.
"""

from torchvision import transforms


IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

TARGET_SIZE = (224, 224)


# Used only for training images
train_transform = transforms.Compose([
    transforms.Resize(TARGET_SIZE),

    transforms.RandomHorizontalFlip(p=0.5),

    transforms.RandomRotation(15),

    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=IMAGENET_MEAN,
        std=IMAGENET_STD
    )
])


# Used for validation and test images
# No random augmentation
eval_transform = transforms.Compose([
    transforms.Resize(TARGET_SIZE),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=IMAGENET_MEAN,
        std=IMAGENET_STD
    )
])