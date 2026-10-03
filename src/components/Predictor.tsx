import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { classifyImage } from "@/lib/classify.functions";

type Score = { label: string; prob: number };

export function Predictor({ frMap }: { frMap: Record<string, string> }) {
  const fn = useServerFn(classifyImage);
  const input = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [scores, setScores] = useState<Score[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const handle = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      setImg(url);
      setScores(null);
      setError(null);
      setLoading(true);
      try {
        const r = await fn({ data: { image: url } });
        setScores(r.scores);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const top = scores?.[0];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        className={`relative grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-dashed bg-background/40 p-4 transition-colors ${drag ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}
      >
        {img ? (
          <img src={img} alt="Image importée" className="max-h-[300px] w-full rounded-xl object-contain" />
        ) : (
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-lg bg-primary/12 font-mono text-xl text-primary ring-1 ring-primary/40">↑</div>
            <p className="mt-4 font-display text-[22px] tracking-tight">Déposez une image satellite</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">ou cliquez pour choisir · JPG / PNG</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 font-mono text-[12px] text-primary">
            ANALYSE EN COURS…
          </div>
        )}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
      </button>

      <div className="rounded-2xl bg-background/40 p-6 ring-1 ring-border">
        <p className="font-mono text-[10px] text-muted-foreground">RÉSULTAT DE LA PRÉDICTION</p>
        {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}
        {!top && !error && (
          <p className="mt-4 text-[14px] text-muted-foreground">
            Importez une image pour obtenir la classe prédite et les probabilités.
          </p>
        )}
        {top && (
          <>
            <p className="mt-3 font-display text-[40px] leading-none tracking-tight text-primary">{top.label}</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              {frMap[top.label]} · confiance {(top.prob * 100).toFixed(1)} %
            </p>
            <div className="mt-6 space-y-2">
              {scores!.slice(0, 5).map((s) => (
                <div key={s.label} className="font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{(s.prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${s.prob * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
