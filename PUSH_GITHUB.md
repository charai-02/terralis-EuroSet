# Mettre le projet sur GitHub (manuellement)

1. Créez un dépôt **vide** sur https://github.com/new (sans README, sans .gitignore).
2. Dans ce dossier, ouvrez un terminal puis :

```bash
git init
git add .
git commit -m "Projet TERRALIS - classification EuroSAT"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM/VOTRE_DEPOT.git
git push -u origin main
```

GitHub demande un mot de passe : utilisez un *Personal Access Token*
(GitHub > Settings > Developer settings > Tokens).

## Lancer l'application
```bash
npm install
npm run dev
```
Pour la prédiction d'image, définir la variable `LOVABLE_API_KEY` dans un fichier `.env`.

## Partie Python
```bash
cd python
pip install torch torchvision scikit-learn
python train.py
```
