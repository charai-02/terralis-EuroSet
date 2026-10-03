"""Definition du modele : CNN pre-entraine + tete de classification."""

import torch
import torch.nn as nn
from torchvision import models

from config import CFG


def build_model(backbone: str = None, num_classes: int = None, pretrained: bool = True):
    backbone = backbone or CFG.backbone
    num_classes = num_classes or CFG.num_classes

    if backbone == "resnet50":
        net = models.resnet50(weights="IMAGENET1K_V2" if pretrained else None)
        in_features = net.fc.in_features
        net.fc = nn.Sequential(nn.Dropout(0.2), nn.Linear(in_features, num_classes))
    elif backbone == "efficientnet_b0":
        net = models.efficientnet_b0(weights="IMAGENET1K_V1" if pretrained else None)
        in_features = net.classifier[1].in_features
        net.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(in_features, num_classes))
    elif backbone == "mobilenet_v3_large":
        net = models.mobilenet_v3_large(weights="IMAGENET1K_V2" if pretrained else None)
        in_features = net.classifier[3].in_features
        net.classifier[3] = nn.Linear(in_features, num_classes)
    else:
        raise ValueError(f"Backbone inconnu : {backbone}")

    return net


def set_backbone_trainable(model: nn.Module, trainable: bool):
    """Gele / degele toutes les couches sauf la tete de classification."""
    head_names = ("fc", "classifier")
    for name, param in model.named_parameters():
        if name.split(".")[0] in head_names:
            param.requires_grad = True
        else:
            param.requires_grad = trainable


def count_parameters(model: nn.Module) -> int:
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


if __name__ == "__main__":
    m = build_model(pretrained=False)
    x = torch.randn(2, 3, CFG.image_size, CFG.image_size)
    print(m(x).shape, count_parameters(m), "parametres")
