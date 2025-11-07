  export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    const { nomProduit, descProduit } = await req.json();

    if (!nomProduit) {
      return new Response(
        JSON.stringify({ error: "Nom du produit manquant" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Génère : 
1️⃣ Un titre SEO optimisé (max 110 caractères),
2️⃣ Une meta description adaptée à Google,
3️⃣ 40 hashtags Vinted et 40 hashtags Shopify pour un produit appelé "${nomProduit}". 
Description supplémentaire : ${descProduit}.`
              }
            ]
          }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Erreur API OpenAI");
    }

    // ✅ On renvoie proprement le JSON
    return new Response(JSON.stringify(data), {
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


