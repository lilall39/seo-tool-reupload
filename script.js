// 🚀 Fichier : script.js
// Gère la génération SEO + analyse d'image Lil-Shop

// === 🧠 GÉNÉRATION TEXTE SEO ===
async function genererMeta() {
  const nomProduit = document.getElementById("nomProduit").value.trim();
  const descProduit = document.getElementById("descProduit").value.trim();
  const result = document.getElementById("resultMeta");

  if (!nomProduit) {
    result.textContent = "❌ Merci d’entrer un nom de produit.";
    return;
  }

  result.textContent = "⏳ Génération en cours...";

  try {
    const response = await fetch("/api/generate-meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomProduit, descProduit }),
    });

    const data = await response.json();

    if (data.error) {
      result.textContent = "⚠️ Erreur : " + data.error;
    } else {
      result.textContent = data.result;
      document.getElementById("copyButtons").style.display = "block";
    }
  } catch (error) {
    result.textContent = "❌ Erreur de connexion : " + error.message;
  }
}

// === 🔁 Réinitialisation ===
function recommencer() {
  document.getElementById("nomProduit").value = "";
  document.getElementById("descProduit").value = "";
  document.getElementById("resultMeta").textContent = "";
  document.getElementById("resultImage").textContent = "";
  document.getElementById("copyButtons").style.display = "none";
  document.getElementById("imageInput").value = "";
}

// === 📋 Fonctions de copie ===
function copierTitre() {
  copierTexte("Titre SEO");
}
function copierMeta() {
  copierTexte("Meta Description");
}
function copierHashtagsVinted() {
  copierTexte("Hashtags Vinted");
}
function copierHashtagsShopify() {
  copierTexte("Hashtags Shopify");
}

function copierTexte(motCle) {
  const text = document.getElementById("resultMeta").textContent;
  const match = text.match(new RegExp(`\\*\\*${motCle}\\s*:\\*\\*\\s*([^*]+)`, "i"));
  if (match) {
    navigator.clipboard.writeText(match[1].trim());
    alert(`${motCle} copié !`);
  } else {
    alert(`${motCle} introuvable.`);
  }
}

// === 🖼️ ANALYSE D’IMAGE ===
async function analyserImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];
  const result = document.getElementById("resultImage");

  if (!file) {
    result.textContent = "❌ Choisis une image avant d’analyser.";
    return;
  }

  result.textContent = "⏳ Analyse de l’image en cours...";

  // 🧠 Convertir l’image en Base64
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(",")[1]; // on enlève "data:image/jpeg;base64,"

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await response.json();

      if (data.error) {
        result.textContent = "⚠️ Erreur : " + data.error;
      } else {
        result.textContent = "🧠 Description générée :\n" + data.description;
      }
    } catch (error) {
      result.textContent = "❌ Erreur d’analyse : " + error.message;
    }
  };

  reader.readAsDataURL(file);
}






