  export const config = { runtime: "edge" };

// ✅ Lil-Shop SEO — Version finale propre (présentation + virgules + sans 🧾)
export default async function handler(req) {
  try {
    const { nomProduit, descProduit } = await req.json();
    if (!nomProduit || !descProduit) {
      return new Response(
        JSON.stringify({ error: "Champs manquants" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔎 Détection locale de l’état
    const descLower = descProduit.toLowerCase();
    let etat = "";
    if (descLower.includes("neuf") || descLower.includes("neuve")) etat = "article neuf";
    else if (descLower.includes("vintage")) etat = "vintage";
    else if (
      descLower.includes("tbe") ||
      descLower.includes("occasion") ||
      descLower.includes("seconde main")
    )
      etat = "seconde main TBE";

    // 🧠 Appel OpenAI : texte brut (pas de markdown ni d’emoji)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Tu es un expert SEO e-commerce (Shopify & Vinted).
Règles :
- Titre SEO : <110 caractères
- Meta description : 140–160 caractères
- Inclure marque, matière, couleur, style, et l’état si fourni
- Évite le markdown (** ou #)
- Les hashtags Shopify doivent être séparés par des virgules, pas de #
- Ne jamais écrire la phrase "Prix d’origine payé en boutique extérieure lors de l’achat neuf"
- Format clair sans mise en gras :
Titre SEO : ...
Meta Description : ...
Hashtags Vinted : ...
Hashtags Shopify : ...`,
          },
          {
            role: "user",
            content: `Nom du produit : ${nomProduit}
Description : ${descProduit}
État détecté : ${etat || "non précisé"}

Génère :
1️⃣ Titre SEO (<110 caractères)
2️⃣ Meta description 140–160 caractères
3️⃣ 40 hashtags Vinted (avec dièses)
4️⃣ 40 hashtags Shopify (séparés par des virgules)

Inclure systématiquement ces hashtags fixes :
#${nomProduit.replace(/\s+/g, '').toLowerCase()}, #pascher, #tendance, #mode, #femme, #fille, #homme, #enfant, #jeune, #cadeau, #idéeCadeau, #fête, #cadeauFemme, #cadeauArtisanal, #italie, #espagne, #portugal, #angleterre, #suisse, #belgique, #paysBas.`,
          },
        ],
      }),
    });

    const data = await response.json();
    let result = data?.choices?.[0]?.message?.content || "";

    // 🪄 Nettoyage & ajout de l’état dans le titre
    result = result
      .replaceAll("*", "")
      .replaceAll("**", "")
      .replaceAll("🧾", "")
      .trim();

    if (etat) {
      result = result.replace(
        /(Titre SEO\s*:\s*)(.*)/i,
        (_, prefix, titre) => {
          titre = titre.replace(/seconde main TBE|article neuf|vintage/gi, "").trim();
          return `${prefix}${titre} – ${etat}`;
        }
      );
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erreur API :", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
