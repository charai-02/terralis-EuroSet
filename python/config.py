"""Configuration centrale du projet EuroSAT.

Projet de fin de module — Classification de l'occupation des sols
Auteurs : Ismail Charai, Abderahman Elharakani
"""

from dataclasses import dataclass, field
from pathlib import Path

CLASSES = [
    "AnnualCrop",
    "Forest",
    "HerbaceousVegetation",
    "Highway",
    "Industrial",
    "Pasture",
    "PermanentCrop",
    "Residential",
    "River",
    "SeaLake",
]


@dataclass
class Config:
    # Dossier racine du dataset EuroSAT (kaggle.com/datasets/apollo2506/eurosat-dataset)
    data_dir: Path = Path("data/EuroSAT")
    outputs_dir: Path = Path("outputs")

    image_size: int = 64
    batch_size: int = 64
    num_workers: int = 4

    # Partition stratifiee
    train_ratio: float = 0.8
    val_ratio: float = 0.1
    test_ratio: float = 0.1
    seed: int = 42

    # Entrainement
    backbone: str = "resnet50"  # resnet50 | efficientnet_b0 | mobilenet_v3_large
    epochs: int = 30
    lr: float = 3e-4
    weight_decay: float = 1e-4
    label_smoothing: float = 0.1
    freeze_backbone_epochs: int = 3
    mixup_alpha: float = 0.2
    use_amp: bool = True

    classes: list = field(default_factory=lambda: list(CLASSES))

    @property
    def num_classes(self) -> int:
        return len(self.classes)


CFG = Config()
