
import { GoogleGenAI } from "@google/genai";
import { Client } from '../types';

const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateClientMessage = async (client: Client): Promise<string> => {
  const ai = getAi();
  if (!ai) return "Erreur: Clé API manquante. Impossible de générer le message.";

  const prompt = `
    Tu es Shelley, prothésiste ongulaire et fondatrice de Shelleynailss.
    Rédige un message court, amical et professionnel pour Instagram (DM) à ta cliente.
    
    IMPORTANT :
    - Tu parles en ton nom propre : utilise "Je".
    - Ne te présente pas, elle te connait.
    
    Infos cliente :
    Nom : ${client.name}
    Notes : ${client.notes}
    
    Contexte : C'est un message de fidélisation pour prendre des nouvelles et garder le lien.
    Si ça fait longtemps qu'elle n'est pas venue, dis-lui qu'elle te manque.
    Suggère subtilement de regarder tes dispos si elle a envie de se faire des ongles, mais sans pression.

    Le ton doit être chaleureux, "girl boss" mais poli, avec quelques emojis mignons (ongles, cœur, éclats).
    Ne mets pas de guillemets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Coucou ! J'espère que tu vas bien ? Hâte de te revoir pour sublimer tes ongles 💅✨";
  } catch (error) {
    console.error("Error generating message:", error);
    return "Coucou ! J'espère que tu vas bien ? Hâte de te revoir pour sublimer tes ongles 💅✨";
  }
};

export const analyzeRevenue = async (transactions: any[]): Promise<string> => {
  const ai = getAi();
  if (!ai) return "Clé API manquante.";

  // SÉCURITÉ : On nettoie les transactions pour ne garder que les données simples
  // Cela évite l'erreur "Converting circular structure to JSON" si un objet complexe s'est glissé dans le tableau
  const safeTransactions = transactions.slice(-10).map(t => ({
      date: t.date,
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description
  }));

  const prompt = `
    Analyse ces transactions financières pour mon salon de manucure (Shelleynailss) et donne-moi un bref conseil ou une observation positive (max 2 phrases).
    Adresse-toi directement à moi (Shelley).
    Données: ${JSON.stringify(safeTransactions)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Tes revenus sont stables. Continue comme ça Shelley !";
  } catch (error) {
    console.error("Error analyzing revenue:", error);
    return "Impossible d'analyser les données pour le moment.";
  }
};

export const generateDecorativeImage = async (): Promise<string | null> => {
  const ai = getAi();
  if (!ai) return null;

  const prompt = "A luxurious and abstract background texture for a gift card. Theme: High-end nail art, fluid marble patterns in gold, nude beige, and soft pink colors. Elegant, soft lighting, sparkling dust effects, no text, premium quality.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
