import { createFileRoute } from "@tanstack/react-router";
import { Predictor } from "@/components/Predictor";

import heroMosaic from "@/assets/hero-mosaic.jpg";
import forest from "@/assets/class-forest.jpg";
import annualCrop from "@/assets/class-annualcrop.jpg";
import permanentCrop from "@/assets/class-permanentcrop.jpg";
import pasture from "@/assets/class-pasture.jpg";
import herbaceous from "@/assets/class-herbaceous.jpg";
import highway from "@/assets/class-highway.jpg";
import industrial from "@/assets/class-industrial.jpg";
import residential from "@/assets/class-residential.jpg";
import river from "@/assets/class-river.jpg";
import seaLake from "@/assets/class-sealake.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "TERRALIS — Classification de l'occupation des sols (EuroSAT)",
      },
      {
        name: "description",
        content:
          "Projet de fin de module : classification de l'occupation des sols par imagerie satellite Sentinel-2 (EuroSAT), pipeline CNN, métriques et prédiction en ligne.",
      },
      {
        property: "og:title",
        content: "TERRALIS — Classification de l'occupation des sols (EuroSAT)",
      },
      {
        property: "og:description",
        content:
          "Pipeline CNN sur EuroSAT : dataset, méthodologie, métriques (accuracy, precision, recall, F1) et prédiction d'images.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CLASSES = [
  { n: "01", label: "AnnualCrop", fr: "Culture annuelle", img: annualCrop },
  { n: "02", label: "Forest", fr: "Forêt", img: forest },
  { n: "03", label: "HerbaceousVegetation", fr: "Végétation herbacée", img: herbaceous },
  { n: "04", label: "Highway", fr: "Autoroute", img: highway },
  { n: "05", label: "Industrial", fr: "Zone industrielle", img: industrial },
  { n: "06", label: "Pasture", fr: "Pâturage", img: pasture },
  { n: "07", label: "PermanentCrop", fr: "Culture permanente", img: permanentCrop },
  { n: "08", label: "Residential", fr: "Résidentiel", img: residential },
  { n: "09", label: "River", fr: "Rivière", img: river },
  { n: "10", label: "SeaLake", fr: "Mer / lac", img: seaLake },
];

const STEPS = [
  {
    n: "01",
    title: "Données",
    text: "27 000 tuiles Sentinel-2 (64×64, 13 bandes), 10 classes, partition stratifiée 80/10/10.",
  },
  {
    n: "02",
    title: "Augmentation",
    text: "Rotations, miroirs, recadrages aléatoires et jitter colorimétrique pour limiter le sur-apprentissage.",
  },
  {
    n: "03",
    title: "Transfer learning",
    text: "Backbone ResNet-50 / EfficientNet pré-entraîné ImageNet, tête multi-classes fine-tunée (AdamW, cosine).",
  },
  {
    n: "04",
    title: "Évaluation",
    text: "Accuracy, precision, recall, F1 macro et pondéré, matrice de confusion, validation croisée 5-fold.",
  },
];

const PER_CLASS = [
  ["AnnualCrop", "98.2", "98.5", "98.3"],
  ["Forest", "99.4", "99.6", "99.5"],
  ["HerbaceousVegetation", "97.6", "97.1", "97.3"],
  ["Highway", "97.9", "97.4", "97.6"],
  ["Industrial", "99.1", "99.0", "99.0"],
  ["Pasture", "98.4", "98.0", "98.2"],
  ["PermanentCrop", "96.8", "97.2", "97.0"],
  ["Residential", "99.3", "99.5", "99.4"],
  ["River", "98.0", "97.6", "97.8"],
  ["SeaLake", "99.6", "99.8", "99.7"],
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center rounded-md bg-primary/15 font-mono text-xs text-primary ring-1 ring-primary/40">
              ◈
            </div>
            <div className="leading-tight">
              <p className="font-display text-[15px] tracking-wide">TERRALIS</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                occupation des sols · projet de fin de module
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-7 font-mono text-[11px] text-muted-foreground md:flex">
            <a href="#dataset" className="transition-colors hover:text-foreground">
              01 Dataset
            </a>
            <a href="#pipeline" className="transition-colors hover:text-foreground">
              02 Pipeline
            </a>
            <a href="#resultats" className="transition-colors hover:text-foreground">
              03 Résultats
            </a>
            <a href="#prediction" className="text-accent transition-colors hover:text-foreground">
              04 Prédiction
            </a>
          </div>
          <div className="font-mono text-[10px] tracking-wider text-muted-foreground">
            EUROSAT · 10 CLASSES
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <div className="aurora-field absolute inset-0" />
        <div className="grid-field absolute inset-0 opacity-[0.15]" />
        <div className="relative mx-auto grid max-w-[1200px] gap-8 px-6 pt-16 pb-10 md:grid-cols-[1.4fr_1fr]">
          <div className="animate-fadeup">
            <div className="mb-5 flex items-center gap-2 font-mono text-[11px] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />
              PROJET DE FIN DE MODULE · VU DE L&apos;ORBITE
            </div>
            <h1 className="font-display text-[64px] leading-[0.92] tracking-tight text-balance md:text-[84px]">
              CLASSIFICATION
              <br />
              DE L&apos;OCCUPATION
              <br />
              <span className="text-primary">DES SOLS</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-pretty text-muted-foreground">
              Analyse de l&apos;imagerie satellite multispectrale via un pipeline de CNN à
              apprentissage par transfert, évaluée sur le jeu EuroSAT (Sentinel-2). Lecture de la
              Terre depuis l&apos;orbite.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#prediction" className="rounded-full bg-primary/12 px-4 py-2 text-[13px] font-medium text-primary ring-1 ring-primary/40 transition-colors hover:bg-primary/20">
                Tester une image →
              </a>
            </div>
          </div>
          <div className="animate-rise self-end rounded-2xl bg-panel/60 p-5 ring-1 ring-border backdrop-blur-xl [animation-delay:120ms]">
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>LECTURE INSTRUMENT</span>
              <span className="text-accent">RÉFÉRENCE</span>
            </div>
            <img
              src={heroMosaic}
              alt="Mosaïque de tuiles satellite multispectrales classées par occupation du sol"
              width={1024}
              height={768}
              className="aspect-[4/3] w-full rounded-xl object-cover outline-1 -outline-offset-1 outline-border"
            />
            <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="rounded-lg bg-background/50 px-3 py-2 ring-1 ring-border">
                <p className="text-[9px] text-muted-foreground">ACCURACY</p>
                <p className="text-lg text-foreground">98.7%</p>
              </div>
              <div className="rounded-lg bg-background/50 px-3 py-2 ring-1 ring-border">
                <p className="text-[9px] text-muted-foreground">MACRO F1</p>
                <p className="text-lg text-foreground">98.5%</p>
              </div>
              <div className="rounded-lg bg-background/50 px-3 py-2 ring-1 ring-border">
                <p className="text-[9px] text-muted-foreground">CLASSES</p>
                <p className="text-lg text-foreground">10</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="dataset" className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] text-primary">(a) · EXPLORATEUR DE DONNÉES</p>
            <h2 className="mt-1 font-display text-[34px] tracking-tight">10 classes EuroSAT</h2>
          </div>
          <p className="hidden font-mono text-[11px] text-muted-foreground sm:block">
            TUILE · 64×64 px · 10 m/px · SENTINEL-2
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CLASSES.map((c, i) => (
            <div
              key={c.label}
              className="animate-rise rounded-xl bg-panel/50 p-3 ring-1 ring-border backdrop-blur-md transition-colors duration-300 hover:bg-panel hover:ring-primary/50"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <img
                src={c.img}
                alt={`Tuile satellite représentative de la classe ${c.label}`}
                loading="lazy"
                width={512}
                height={512}
                className="aspect-square w-full rounded-lg object-cover outline-1 -outline-offset-1 outline-border"
              />
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium">{c.fr}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{c.label}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{c.n}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pipeline" className="border-y border-border/60 bg-panel/30">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="mb-8">
            <p className="font-mono text-[11px] text-primary">(b) · MÉTHODOLOGIE</p>
            <h2 className="mt-1 font-display text-[34px] tracking-tight">Pipeline de traitement</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="relative rounded-xl bg-background/40 p-5 ring-1 ring-border backdrop-blur-md"
              >
                <span className="font-mono text-[10px] text-accent">{s.n}</span>
                <h3 className="mt-1 font-display text-[22px] tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-pretty text-muted-foreground">
                  {s.text}
                </p>
                {i < STEPS.length - 1 && (
                  <span className="absolute top-5 right-4 hidden text-lg text-border md:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="resultats" className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="mb-8">
          <p className="font-mono text-[11px] text-primary">(c) · TABLEAU DE BORD</p>
          <h2 className="mt-1 font-display text-[34px] tracking-tight">Résultats du modèle</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl bg-panel/50 p-6 ring-1 ring-border backdrop-blur-xl">
            <p className="mb-4 font-mono text-[11px] text-muted-foreground">PERFORMANCE GLOBALE</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-background/50 p-4 ring-1 ring-border">
                <p className="font-mono text-[10px] text-muted-foreground">ACCURACY</p>
                <p className="mt-1 font-display text-[48px] leading-none text-primary">
                  98.7<span className="text-2xl">%</span>
                </p>
              </div>
              <div className="rounded-xl bg-background/50 p-4 ring-1 ring-border">
                <p className="font-mono text-[10px] text-muted-foreground">F1 MACRO</p>
                <p className="mt-1 font-display text-[48px] leading-none">98.5</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 font-mono text-[12px]">
              <div className="flex justify-between rounded-lg bg-background/40 px-3 py-2 ring-1 ring-border">
                <span className="text-muted-foreground">PRECISION</span>
                <span className="text-foreground">98.6</span>
              </div>
              <div className="flex justify-between rounded-lg bg-background/40 px-3 py-2 ring-1 ring-border">
                <span className="text-muted-foreground">RECALL</span>
                <span className="text-foreground">98.4</span>
              </div>
            </div>
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
              [VALEURS DE RÉFÉRENCE — littérature EuroSAT ≈ 98–99 %. À remplacer par les résultats
              produits par evaluate.py après votre entraînement.]
            </p>
          </div>
          <div className="rounded-2xl bg-panel/50 p-6 ring-1 ring-border backdrop-blur-xl">
            <p className="mb-4 font-mono text-[11px] text-muted-foreground">MÉTRIQUES PAR CLASSE</p>
            <table className="w-full border-collapse font-mono text-[11px]">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-2 text-left font-normal">Classe</th>
                  <th className="pb-2 text-right font-normal">Prec.</th>
                  <th className="pb-2 text-right font-normal">Recall</th>
                  <th className="pb-2 text-right font-normal">F1</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {PER_CLASS.map((r) => (
                  <tr key={r[0]} className="border-t border-border/60">
                    <td className="py-2">{r[0]}</td>
                    <td className="text-right">{r[1]}</td>
                    <td className="text-right">{r[2]}</td>
                    <td className="text-right text-primary">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="prediction" className="border-t border-border/60 bg-panel/30">
        <div className="mx-auto max-w-[1200px] px-6 py-14">
          <div className="mb-8">
            <p className="font-mono text-[11px] text-primary">(d) · PRÉDICTION</p>
            <h2 className="mt-1 font-display text-[34px] tracking-tight">Classer votre image</h2>
          </div>
          <Predictor frMap={Object.fromEntries(CLASSES.map((c) => [c.label, c.fr]))} />
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">
          <p className="font-mono text-[11px] text-muted-foreground">
            TERRALIS · Classification de l&apos;occupation des sols — EuroSAT
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">Projet de fin de module</p>
        </div>
      </footer>
    </div>
  );
}
