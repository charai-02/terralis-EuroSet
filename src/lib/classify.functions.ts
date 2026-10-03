import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LABELS = [
  "AnnualCrop", "Forest", "HerbaceousVegetation", "Highway", "Industrial",
  "Pasture", "PermanentCrop", "Residential", "River", "SeaLake",
] as const;

export const classifyImage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ image: z.string().startsWith("data:image/").max(8_000_000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Clé IA manquante");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a land-use classifier trained on EuroSAT (Sentinel-2). Classify the satellite tile into the 10 EuroSAT classes. Return probabilities summing to 1.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Classify this image." },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string", enum: LABELS },
                        prob: { type: "number" },
                      },
                      required: ["label", "prob"],
                    },
                  },
                },
                required: ["scores"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report" } },
      }),
    });
    if (res.status === 429) throw new Error("Trop de requêtes, réessayez dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés.");
    if (!res.ok) throw new Error("Erreur de prédiction");
    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = JSON.parse(args ?? "{}") as { scores?: { label: string; prob: number }[] };
    const scores = (parsed.scores ?? [])
      .filter((s) => (LABELS as readonly string[]).includes(s.label))
      .sort((a, b) => b.prob - a.prob);
    const total = scores.reduce((s, x) => s + x.prob, 0) || 1;
    return { scores: scores.map((s) => ({ label: s.label, prob: s.prob / total })) };
  });
