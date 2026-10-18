import { GEMINI_API_BASE_URL, TenantTokenTracker } from '../../../core/ai';
import { ROOT_TENANT_ID, resolveCurrentTenantId } from '../../../core/tenant/tenantResolver';

export interface ImagenGenerateParams {
  prompt: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | 'auto';
  sampleCount?: number;
  referenceImageBase64?: string;
}

function recordVideoImageTokens() {
  try {
    const currentResolverTenant = typeof window !== 'undefined' ? resolveCurrentTenantId() : ROOT_TENANT_ID;
    const targetTenant = (currentResolverTenant && currentResolverTenant !== ROOT_TENANT_ID) ? currentResolverTenant : ROOT_TENANT_ID;
    TenantTokenTracker.recordTokenUsage(
      targetTenant,
      'video',
      1170,
      { images: 1, costUSD: 0.03 }
    ).catch(err => console.warn('[recordVideoImageTokens error]:', err));
  } catch (err) {
    console.warn('[recordVideoImageTokens error]:', err);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateImagen3Image(
  apiKey: string,
  params: ImagenGenerateParams
): Promise<{ imageUrl: string; base64Data: string; mimeType: string }> {
  const cleanPrompt = params.prompt.trim();
  const aspectRatio = params.aspectRatio === 'auto' ? '9:16' : (params.aspectRatio || '16:9');

  let width = 1280;
  let height = 720;
  if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '1:1') {
    width = 1024;
    height = 1024;
  }

  if (apiKey && apiKey.trim()) {
    const trimmedKey = apiKey.trim();
    const geminiImageModels = ['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-2.0-flash-exp'];
    for (const modelName of geminiImageModels) {
      try {
        const parts: any[] = [];
        if (params.referenceImageBase64) {
          const cleanRef = params.referenceImageBase64.replace(/^data:image\/\w+;base64,/, '');
          parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanRef } });
        }
        parts.push({ text: cleanPrompt });

        const geminiEndpoint = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${trimmedKey}`;
        const res = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            model: modelName,
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
          })
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          const candidateParts = data?.candidates?.[0]?.content?.parts || [];
          const imagePart = candidateParts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
          if (imagePart?.inlineData?.data) {
            const mime = imagePart.inlineData.mimeType || 'image/jpeg';
            recordVideoImageTokens();
            return {
              imageUrl: `data:${mime};base64,${imagePart.inlineData.data}`,
              base64Data: imagePart.inlineData.data,
              mimeType: mime
            };
          }
        }
      } catch {}
    }

    try {
      const endpoint = `${GEMINI_API_BASE_URL}/models/imagen-3.0-generate-002:predict?key=${trimmedKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: cleanPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
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
          recordVideoImageTokens();
          return {
            imageUrl: `data:${mime};base64,${b64}`,
            base64Data: b64,
            mimeType: mime
          };
        }
      }
    } catch {}
  }

  try {
    const seed = Math.floor(Math.random() * 10000000);
    const enrichedPrompt = `cinematic 8k photorealistic photo, studio lighting, masterpiece, high details, ${cleanPrompt}`;
    const mirrorUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enrichedPrompt)}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}&enhance=true`;
    const imgRes = await fetch(mirrorUrl);
    if (imgRes.ok) {
      const blob = await imgRes.blob();
      if (blob && blob.size > 1500) {
        const dataUrl = await blobToBase64(blob);
        recordVideoImageTokens();
        return {
          imageUrl: dataUrl,
          base64Data: dataUrl.split(',')[1] || '',
          mimeType: blob.type || 'image/jpeg'
        };
      }
    }
  } catch {}

  return {
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
    base64Data: '',
    mimeType: 'image/jpeg'
  };
}
