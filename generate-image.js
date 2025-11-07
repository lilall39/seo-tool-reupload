 export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    // ✅ on récupère le flux sous forme brute (base64 envoyé par le front)
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Aucune image reçue" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Construction de l'objet image attendu
    const imageObject = {
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
    };

    // ✅ Appel correct de l’API OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Décris brièvement ce produit en français, ton e-commerce." },
              imageObject, // 👈 objet et non string
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Erreur API OpenAI");
    }

    const description =
      data.choices?.[0]?.message?.content?.trim() || "Aucune description générée.";

    return new Response(JSON.stringify({ description }), {
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





