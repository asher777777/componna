/**
 * Client-side color extractor using HTML5 Canvas
 * Extracts top vibrant / prominent colors from an image URL or File
 */

export interface ExtractedColor {
  hex: string;
  count: number;
}

export async function extractDominantColorsFromImage(
  imageSource: string | File,
  maxColors: number = 5
): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const handleImageLoad = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(['#6366f1', '#0ea5e9', '#0f172a']);
          }

          // Scale down for fast processing
          const width = 80;
          const height = Math.floor((img.naturalHeight / img.naturalWidth) * 80) || 80;
          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height).data;

          const colorMap: Record<string, number> = {};

          for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            // Ignore transparent and nearly transparent pixels
            if (a < 128) continue;

            // Ignore pure white, extreme greys and pure black
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness > 245 || brightness < 15) continue;

            // Quantize to smooth slight variations
            const qR = Math.round(r / 16) * 16;
            const qG = Math.round(g / 16) * 16;
            const qB = Math.round(b / 16) * 16;

            const hex = `#${((1 << 24) + (qR << 16) + (qG << 8) + qB).toString(16).slice(1)}`;
            colorMap[hex] = (colorMap[hex] || 0) + 1;
          }

          const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .map(([hex]) => hex)
            .slice(0, maxColors);

          if (sortedColors.length === 0) {
            return resolve(['#6366f1', '#0ea5e9', '#0f172a']);
          }

          resolve(sortedColors);
        } catch (err) {
          console.warn('Canvas color extraction error, using fallback:', err);
          resolve(['#6366f1', '#0ea5e9', '#0f172a']);
        }
      };

      img.onload = handleImageLoad;
      img.onerror = () => {
        resolve(['#6366f1', '#0ea5e9', '#0f172a']);
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            resolve(['#6366f1', '#0ea5e9', '#0f172a']);
          }
        };
        reader.readAsDataURL(imageSource);
      }
    } catch {
      resolve(['#6366f1', '#0ea5e9', '#0f172a']);
    }
  });
}
