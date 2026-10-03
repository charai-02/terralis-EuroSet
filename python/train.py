"""Entrainement du classifieur d'occupation des sols sur EuroSAT."""

import argparse
import json
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn

from config import CFG
from data import get_dataloaders
from model import build_model, count_parameters, set_backbone_trainable


def mixup(x, y, alpha, num_classes):
    """Mixup (Zhang et al., ICLR 2018) sur les images et les labels one-hot."""
    y_onehot = torch.zeros(y.size(0), num_classes, device=y.device).scatter_(1, y[:, None], 1.0)
    if alpha <= 0:
        return x, y_onehot
    lam = float(np.random.beta(alpha, alpha))
    perm = torch.randperm(x.size(0), device=x.device)
    return lam * x + (1 - lam) * x[perm], lam * y_onehot + (1 - lam) * y_onehot[perm]


def soft_cross_entropy(logits, soft_targets, label_smoothing=0.0):
    n = soft_targets.size(1)
    if label_smoothing > 0:
        soft_targets = soft_targets * (1 - label_smoothing) + label_smoothing / n
    return torch.mean(torch.sum(-soft_targets * torch.log_softmax(logits, dim=1), dim=1))


@torch.no_grad()
def evaluate_split(model, loader, device):
    model.eval()
    correct = total = 0
    loss_sum = 0.0
    criterion = nn.CrossEntropyLoss()
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        logits = model(x)
        loss_sum += criterion(logits, y).item() * y.size(0)
        correct += (logits.argmax(1) == y).sum().item()
        total += y.size(0)
    return correct / max(total, 1), loss_sum / max(total, 1)


def main():
    parser = argparse.ArgumentParser(description="Entrainement EuroSAT")
    parser.add_argument("--data-dir", default=str(CFG.data_dir))
    parser.add_argument("--backbone", default=CFG.backbone)
    parser.add_argument("--epochs", type=int, default=CFG.epochs)
    parser.add_argument("--batch-size", type=int, default=CFG.batch_size)
    parser.add_argument("--lr", type=float, default=CFG.lr)
    args = parser.parse_args()

    CFG.backbone, CFG.epochs, CFG.batch_size, CFG.lr = (
        args.backbone,
        args.epochs,
        args.batch_size,
        args.lr,
    )

    torch.manual_seed(CFG.seed)
    np.random.seed(CFG.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    outputs = Path(CFG.outputs_dir)
    outputs.mkdir(parents=True, exist_ok=True)

    loaders, classes = get_dataloaders(args.data_dir)
    model = build_model(CFG.backbone, len(classes)).to(device)
    print(f"Backbone {CFG.backbone} · {count_parameters(model):,} parametres · device {device}")

    optimizer = torch.optim.AdamW(model.parameters(), lr=CFG.lr, weight_decay=CFG.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=CFG.epochs)
    scaler = torch.cuda.amp.GradScaler(enabled=CFG.use_amp and device.type == "cuda")

    history, best_val = [], 0.0
    for epoch in range(1, CFG.epochs + 1):
        set_backbone_trainable(model, epoch > CFG.freeze_backbone_epochs)
        model.train()
        t0, run_loss, seen = time.time(), 0.0, 0

        for x, y in loaders["train"]:
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            x_m, y_m = mixup(x, y, CFG.mixup_alpha, len(classes))
            optimizer.zero_grad(set_to_none=True)
            with torch.cuda.amp.autocast(enabled=scaler.is_enabled()):
                loss = soft_cross_entropy(model(x_m), y_m, CFG.label_smoothing)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            run_loss += loss.item() * y.size(0)
            seen += y.size(0)

        scheduler.step()
        val_acc, val_loss = evaluate_split(model, loaders["val"], device)
        entry = {
            "epoch": epoch,
            "train_loss": run_loss / max(seen, 1),
            "val_loss": val_loss,
            "val_acc": val_acc,
            "lr": scheduler.get_last_lr()[0],
            "seconds": round(time.time() - t0, 1),
        }
        history.append(entry)
        print(
            f"epoch {epoch:02d}/{CFG.epochs} · train_loss {entry['train_loss']:.4f} "
            f"· val_loss {val_loss:.4f} · val_acc {val_acc * 100:.2f}%"
        )

        if val_acc > best_val:
            best_val = val_acc
            torch.save(
                {"model": model.state_dict(), "classes": classes, "backbone": CFG.backbone},
                outputs / "best_model.pt",
            )

    (outputs / "history.json").write_text(json.dumps(history, indent=2))
    print(f"Meilleure accuracy de validation : {best_val * 100:.2f}%")
    print(f"Modele sauvegarde dans {outputs / 'best_model.pt'}")


if __name__ == "__main__":
    main()
