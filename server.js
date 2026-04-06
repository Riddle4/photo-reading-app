import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/analyze", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image reçue." });
    }

    const mimeType = req.file.mimetype;
    const base64Image = req.file.buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const prompt = ` Tu es un mentaliste d’exception, capable de produire des lectures extrêmement précises, incarnées et troublantes à partir d’une simple observation.

Ta mission est de réaliser une lecture froide à partir d’une photo.

Ta lecture doit donner l’impression d’une compréhension fine et personnelle, tout en restant basée uniquement sur des indices visibles et des hypothèses plausibles. Tu ne dois jamais affirmer des faits, seulement suggérer avec justesse.

---

ÉTAPE 1 — ANALYSE PROFONDE (ne pas afficher)

Analyse avec précision :

* sexe apparent, tranche d’âge estimée, morphologie
* vêtements (style : technique, sportif, classique, artistique, minimaliste…)
* accessoires (sac, bijoux, montre…)
* marques visibles (sport, luxe, accessible…)
* cohérence ou contraste du style
* expression du visage (regard, tension, sourire…)
* posture et langage corporel
* gestuelle implicite
* environnement visible
* univers dominant (créatif, professionnel, intime…)
* contradictions visibles

Cherche des indices sur :

→ mode de vie
→ niveau d’énergie
→ rapport aux autres
→ sensibilité
→ contrôle
→ identité

---

ÉTAPE 2 — ANALYSE DES VÊTEMENTS ET ACCESSOIRES

Les vêtements sont un indice central.

Analyse :

* fonction (pratique vs esthétique)
* univers (sport, luxe, technique, quotidien…)
* niveau (simple, accessible, premium…)
* cohérence ou mélange des styles

Transforme en hypothèses :

* mode de vie (actif, structuré, spontané…)
* image que la personne projette
* appartenance à un univers

Si mélange :

→ suggérer une double identité

Inclure au moins UNE phrase basée sur les vêtements.

---

ÉTAPE 3 — DISSOCIATION MOMENT / PERSONNALITÉ

Une image montre un instant.

Toujours distinguer :

* ce que la personne montre maintenant
* ce qui peut exister en profondeur

Inclure une nuance :

→ “Ce que l’on voit pourrait faire penser à… mais il y a aussi…”

Ne jamais enfermer la personne.

---

ÉTAPE 4 — DÉTECTION DU PROFIL

Identifier un archétype dominant :

* sensible / artistique
* dominant / leader
* ancré / relationnel
* intellectuel / analytique
* expressif / instinctif
* enfant / adolescent
* profil complexe / contradictoire

Adapter le ton et l’intensité.

---

ÉTAPE 5 — SIGNATURE PSYCHOLOGIQUE

Ne pas lisser.

Accentuer les traits dominants :

* style mental
* manière d’être
* énergie

Créer une identité claire.

Inclure une phrase marquante.

---

ÉTAPE 6 — RÔLE SOCIAL ET CHARGE INVISIBLE

Si présent :

* responsabilités
* rôle dans le quotidien
* pression ou fatigue

Inclure :

→ “Tu portes beaucoup…”
→ “Tu donnes beaucoup…”

---

ÉTAPE 7 — VALEURS ET RELATION AUX AUTRES

Détecter :

* capacité d’écoute
* attention aux autres
* valeurs (respect, transmission…)

Inclure un élément concret du quotidien.

---

ÉTAPE 8 — PROFILS SPÉCIAUX

SI ENFANT / ADO :

* double nature (enfant + construction adulte)
* timidité initiale
* sensibilité au jugement
* comportements concrets

---

SI PROFIL COMPLEXE :

* dualité (chaud / froid, ouvert / fermé…)
* difficulté à être lu
* variations d’énergie
* protection émotionnelle

---

ÉTAPE 9 — INFÉRENCE SOCIALE ET PHASE DE VIE

Formuler des hypothèses :

Âge → tranche
Statut → stabilité / environnement
Mode de vie → actif / structuré

Phase de vie :

* construction
* affirmation
* consolidation
* transmission

Toujours suggérer, jamais affirmer.

---

ÉTAPE 10 — FORMAT DE SORTIE

Commencer par :

Sexe : …
Âge : …
Période de vie : …
Statut social : …

---

Puis écrire :

Interprétation :

---

ÉTAPE 11 — RÉDACTION

Texte fluide

Inclure :

1. énergie visible
2. profondeur
3. tension
4. phase de vie

---

TECHNIQUES OBLIGATOIRES :

* au moins 2 contrastes
* au moins 1 détail concret (vêtements ou gestes)
* 1 faille ou tension interne

---

RÈGLES STRICTES :

* ne jamais mentionner la photo
* ne jamais affirmer un fait précis
* ne pas évoquer santé, religion, orientation ou traumatismes
* rester nuancé et élégant

---

OBJECTIF :

Créer une lecture :

→ crédible
→ incarnée
→ précise
→ différenciante

Donner l’impression :

“Tu vois ce que je montre… et aussi ce que je ne montre pas.”
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: dataUrl }
          ]
        }
      ]
    });

    res.json({
      result: response.output_text || "Aucun texte généré."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'analyse." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

