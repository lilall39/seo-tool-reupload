 
export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Aucune image reçue" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const imageObject = {
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
    };

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
              { type: "text", text: "Décris ce produit pour une fiche e-commerce." },
              imageObject,
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur OpenAI :", data);
      throw new Error(data?.error?.message || "Erreur API OpenAI");
    }

    const description = data.choices?.[0]?.message?.content?.trim() || "Aucune description générée.";
    return new Response(JSON.stringify({ description }), {
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


