
export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    const body = await req.json();
    const { nomProduit, descProduit } = body || {};

    if (!nomProduit || !descProduit) {
      return new Response(
        JSON.stringify({ error: "Champs manquants (nomProduit ou descProduit)" }),
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
            content: `Crée un titre SEO, une meta description et 40 hashtags Vinted/Shopify pour : ${nomProduit} (${descProduit}).`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur OpenAI :", data);
      throw new Error(data?.error?.message || "Erreur API OpenAI");
    }

    const message = data.choices?.[0]?.message?.content || "Aucune réponse générée.";
    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur inconnue" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
