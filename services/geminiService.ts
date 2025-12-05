
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

export const generateReminderMessage = async (client: Client, appointmentDate: string): Promise<string> => {
  const ai = getAi();
  if (!ai) return "Erreur: Clé API manquante. Impossible de générer le message.";

  const prompt = `
    Tu es Shelley, prothésiste ongulaire et fondatrice de Shelleynailss.
    Rédige un message court, amical et professionnel pour Instagram (DM) pour rappeler à ta cliente son rendez-vous de demain avec toi.
    
    IMPORTANT :
    - Tu parles en ton nom propre : utilise "Je" (ex: "J'ai hâte de te voir", "Je te rappelle").
    - Ne te présente pas comme une assistante ou "le salon". C'est toi, Shelley, qui écris.
    
    Infos cliente :
    Nom : ${client.name}
    Date du RDV : ${new Date(appointmentDate).toLocaleString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
    Notes sur la cliente : ${client.notes}

    Le ton doit être chaleureux, "girl boss" mais poli, avec quelques emojis mignons (ongles, cœur, éclats).
    Ne mets pas de guillemets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Coucou ! Petit rappel pour ton RDV demain avec moi 💅. Hâte de te voir !";
  } catch (error) {
    console.error("Error generating reminder:", error);
    return "Coucou ! Petit rappel pour ton RDV demain avec moi 💅. Hâte de te voir !";
  }
};

export const analyzeRevenue = async (transactions: any[]): Promise<string> => {
  const ai = getAi();
  if (!ai) return "Clé API manquante.";

  const prompt = `
    Analyse ces transactions financières pour mon salon de manucure (Shelleynailss) et donne-moi un bref conseil ou une observation positive (max 2 phrases).
    Adresse-toi directement à moi (Shelley).
    Données: ${JSON.stringify(transactions.slice(-10))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Tes revenus sont stables. Continue comme ça Shelley !";
  } catch (error) {
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
