"""Chargement et preparation du dataset EuroSAT (RGB)."""

from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms

from config import CFG

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def build_transforms(train: bool):
    if train:
        return transforms.Compose(
            [
                transforms.Resize((CFG.image_size, CFG.image_size)),
                transforms.RandomHorizontalFlip(),
                transforms.RandomVerticalFlip(),
                transforms.RandomRotation(20),
                transforms.ColorJitter(0.2, 0.2, 0.2, 0.05),
                transforms.ToTensor(),
                transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
            ]
        )
    return transforms.Compose(
        [
            transforms.Resize((CFG.image_size, CFG.image_size)),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ]
    )


def stratified_indices(targets, ratios, seed):
    """Retourne des index train/val/test stratifies par classe."""
    rng = np.random.default_rng(seed)
    targets = np.asarray(targets)
    train_idx, val_idx, test_idx = [], [], []
    for cls in np.unique(targets):
        idx = np.where(targets == cls)[0]
        rng.shuffle(idx)
        n = len(idx)
        n_train = int(ratios[0] * n)
        n_val = int(ratios[1] * n)
        train_idx += idx[:n_train].tolist()
        val_idx += idx[n_train : n_train + n_val].tolist()
        test_idx += idx[n_train + n_val :].tolist()
    return train_idx, val_idx, test_idx


def get_dataloaders(data_dir: Path = None):
    data_dir = Path(data_dir or CFG.data_dir)
    if not data_dir.exists():
        raise FileNotFoundError(
            f"Dataset introuvable : {data_dir}\n"
            "Telechargez EuroSAT depuis "
            "https://www.kaggle.com/datasets/apollo2506/eurosat-dataset "
            "et placez les 10 dossiers de classes dans ce repertoire."
        )

    base = datasets.ImageFolder(data_dir)
    train_idx, val_idx, test_idx = stratified_indices(
        base.targets, (CFG.train_ratio, CFG.val_ratio, CFG.test_ratio), CFG.seed
    )

    train_ds = datasets.ImageFolder(data_dir, transform=build_transforms(True))
    eval_ds = datasets.ImageFolder(data_dir, transform=build_transforms(False))

    loaders = {
        "train": DataLoader(
            Subset(train_ds, train_idx),
            batch_size=CFG.batch_size,
            shuffle=True,
            num_workers=CFG.num_workers,
            pin_memory=torch.cuda.is_available(),
            drop_last=True,
        ),
        "val": DataLoader(
            Subset(eval_ds, val_idx),
            batch_size=CFG.batch_size,
            shuffle=False,
            num_workers=CFG.num_workers,
        ),
        "test": DataLoader(
            Subset(eval_ds, test_idx),
            batch_size=CFG.batch_size,
            shuffle=False,
            num_workers=CFG.num_workers,
        ),
    }
    return loaders, base.classes


if __name__ == "__main__":
    loaders, classes = get_dataloaders()
    print("Classes :", classes)
    for split, dl in loaders.items():
        print(f"{split:<6} : {len(dl.dataset)} images")
