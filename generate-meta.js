  
 export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    const { nomProduit, descProduit } = await req.json();

    if (!nomProduit) {
      return new Response(JSON.stringify({ error: "Nom du produit manquant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `
Crée un titre SEO + une meta description + 40 hashtags optimisés Vinted et Shopify
pour ce produit :
Nom : ${nomProduit}
Description : ${descProduit || "Aucune description fournie"}.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Erreur API OpenAI");
    }

    const texte = data.choices?.[0]?.message?.content?.trim() || "Aucun résultat.";

    return new Response(JSON.stringify({ result: texte }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


