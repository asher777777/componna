/**
 * Google Imagen 3 (Nano Banana Pro) Image Generation Service
 */

export interface ImagenGenerateParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  sampleCount?: number;
}

export async function generateImagen3Image(
  apiKey: string,
  params: ImagenGenerateParams
): Promise<{ imageUrl: string; base64Data: string; mimeType: string }> {
  if (!apiKey) {
    throw new Error('נא להגדיר מפתח Google API Key במרכז הסנכרון.');
  }

  const cleanPrompt = params.prompt.trim();
  const aspectRatio = params.aspectRatio || '16:9';

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey.trim()}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [
          { prompt: cleanPrompt }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
          personGeneration: 'ALLOW_ADULT',
          outputMimeType: 'image/jpeg'
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
      const mime = data?.predictions?.[0]?.mimeType || 'image/jpeg';
      if (b64) {
        return {
          imageUrl: `data:${mime};base64,${b64}`,
          base64Data: b64,
          mimeType: mime
        };
      }
    }
  } catch (err) {
    console.warn('[Imagen 3 Direct Predict] Error, attempting fallback:', err);
  }

  // Fallback / High-Res AI Generative endpoint
  const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey.trim()}`;
  const fallbackRes = await fetch(fallbackEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a photorealistic visual matching this detailed prompt: ${cleanPrompt}. Aspect ratio: ${aspectRatio}.`
        }]
      }]
    })
  });

  if (!fallbackRes.ok) {
    const errObj = await fallbackRes.json().catch(() => ({}));
    throw new Error(errObj?.error?.message || 'שגיאה ביצירת תמונה עם Google Imagen 3.');
  }

  const fbData = await fallbackRes.json();
  const inline = fbData?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (inline && inline.inlineData?.data) {
    return {
      imageUrl: `data:${inline.inlineData.mimeType || 'image/jpeg'};base64,${inline.inlineData.data}`,
      base64Data: inline.inlineData.data,
      mimeType: inline.inlineData.mimeType || 'image/jpeg'
    };
  }

  throw new Error('לא התקבלה תמונה מ-Google Imagen 3. נא לוודא שהפרומפט תקין.');
}
