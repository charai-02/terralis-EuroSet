# TERRALIS — Classification de l'occupation des sols (EuroSAT)

Projet de fin de module : classification de l'occupation des sols à partir
d'images satellite Sentinel-2, sur le jeu de données EuroSAT
(27 000 images, 10 classes).

## Fonctionnalités

- **Explorateur de données** : les 10 classes EuroSAT (forêt, rivière,
  zone résidentielle, autoroute, etc.)
- **Méthodologie** : données → augmentation → transfer learning → évaluation
- **Tableau de bord** : accuracy, precision, recall et F1-score par classe
  (valeurs de référence tirées de la littérature, ≈ 98–99 %)
- **Prédiction** : importez une image satellite pour obtenir sa classe
  et le niveau de confiance

## Technologies

- Interface : React 19, TanStack Start, Tailwind CSS
- Prédiction en ligne : modèle d'IA de vision
- Code Python : PyTorch (ResNet-50, EfficientNet-B0, MobileNetV3)

## Code Python

- `config.py` : classes, chemins, hyperparamètres
- `data.py` : chargement, partition 80/10/10, augmentation
- `model.py` : modèles pré-entraînés sur ImageNet
- `train.py` : entraînement (AdamW, Mixup, scheduler cosine)

## Dataset

https://www.kaggle.com/datasets/apollo2506/eurosat-dataset
