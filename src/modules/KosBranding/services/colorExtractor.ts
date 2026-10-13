/**
 * Client-side brand color extractor using HTML5 Canvas
 * Specially optimized for brand logos:
 * - Prioritizes vibrant/chromatic brand colors over backgrounds and anti-aliasing
 * - Filters out white/light backgrounds, transparency, and muddy grays
 * - Accurately captures brand icon colors and dark brand typography
 * - Eliminates quantization bitwise overflow bugs
 * - Deduplicates visually similar colors
 */

export interface ExtractedColor {
  hex: string;
  count: number;
}

interface ColorCluster {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  score: number;
  count: number;
  isChromatic: boolean;
}

function clamp(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}

function toHex(c: number): string {
  return clamp(c).toString(16).padStart(2, '0');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

function colorDistance(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

export async function extractDominantColorsFromImage(
  imageSource: string | File,
  maxColors: number = 4
): Promise<string[]> {
  return new Promise((resolve) => {
    try {
      const img = new Image();

      // Only set crossOrigin on remote HTTP/HTTPS URLs (never on blob: or data:)
      if (
        typeof imageSource === 'string' &&
        (imageSource.startsWith('http://') || imageSource.startsWith('https://')) &&
        typeof window !== 'undefined' &&
        !imageSource.includes(window.location.host)
      ) {
        img.crossOrigin = 'anonymous';
      }

      const handleImageLoad = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            return resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
          }

          // Scale for crisp sampling without dropping thin lines
          const maxDim = 120;
          const natW = img.naturalWidth || 100;
          const natH = img.naturalHeight || 100;
          let width = maxDim;
          let height = Math.round((natH / natW) * maxDim) || maxDim;
          if (height > maxDim) {
            height = maxDim;
            width = Math.round((natW / natH) * maxDim) || maxDim;
          }

          canvas.width = Math.max(16, width);
          canvas.height = Math.max(16, height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

          const clusters: Record<string, ColorCluster> = {};

          // Sample pixels (every pixel for maximum accuracy)
          for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            // 1. Ignore transparent pixels
            if (a < 64) continue;

            const [h, s, l] = rgbToHsl(r, g, b);

            // 2. Ignore pure white or near-white background (lightness > 92%)
            if (l > 0.92) continue;

            // 3. Ignore pure pitch black background edge noise
            if (l < 0.04) continue;

            // 4. Score pixel relevance to brand identity
            let weight = 0;
            const isChromatic = s >= 0.16;

            if (isChromatic) {
              // Vibrant brand color (e.g. logo icon, colored badge)
              // Emphasize high saturation and healthy mid-range lightness
              const saturationMultiplier = Math.pow(s, 1.4);
              const lightnessBalance = 1 - Math.abs(l - 0.5) * 1.1;
              weight = 15 + saturationMultiplier * 35 * Math.max(0.2, lightnessBalance);
            } else {
              // Neutral (text or monochrome icon)
              if (l <= 0.35) {
                // Dark typography / slate text (e.g. "KOSUN" brand text)
                weight = 3.5;
              } else {
                // Muddy anti-aliasing / gray background bleed -> very low score
                weight = 0.05;
              }
            }

            // Quantize into 16-step buckets with strict clamping
            const qR = clamp(Math.round(r / 16) * 16);
            const qG = clamp(Math.round(g / 16) * 16);
            const qB = clamp(Math.round(b / 16) * 16);
            const hex = `#${toHex(qR)}${toHex(qG)}${toHex(qB)}`;

            if (!clusters[hex]) {
              clusters[hex] = {
                hex,
                r: qR,
                g: qG,
                b: qB,
                h,
                s,
                l,
                score: 0,
                count: 0,
                isChromatic,
              };
            }
            clusters[hex].score += weight;
            clusters[hex].count += 1;
          }

          const sortedList = Object.values(clusters).sort((a, b) => b.score - a.score);

          if (sortedList.length === 0) {
            return resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
          }

          const selectedColors: string[] = [];
          const selectedClusters: ColorCluster[] = [];

          // Helper to check distance from already picked colors
          const isDistinct = (candidate: ColorCluster, minDistance: number = 38): boolean => {
            return selectedClusters.every((sel) => colorDistance(candidate, sel) >= minDistance);
          };

          // Step 1: Pick chromatic (vibrant) brand colors first
          const chromaticCandidates = sortedList.filter((c) => c.isChromatic);
          for (const cand of chromaticCandidates) {
            if (selectedColors.length >= maxColors) break;
            if (isDistinct(cand, 38)) {
              selectedColors.push(cand.hex);
              selectedClusters.push(cand);
            }
          }

          // Step 2: Pick high-contrast brand dark/text color (if available)
          const darkCandidates = sortedList.filter((c) => !c.isChromatic && c.l <= 0.40);
          for (const cand of darkCandidates) {
            if (selectedColors.length >= maxColors) break;
            if (isDistinct(cand, 32)) {
              selectedColors.push(cand.hex);
              selectedClusters.push(cand);
            }
          }

          // Step 3: Fill remaining slots with next best distinct colors
          for (const cand of sortedList) {
            if (selectedColors.length >= maxColors) break;
            if (isDistinct(cand, 28)) {
              selectedColors.push(cand.hex);
              selectedClusters.push(cand);
            }
          }

          // Step 4: If still fewer than requested, generate harmonic variants of primary
          if (selectedColors.length < maxColors && selectedColors.length > 0) {
            const primary = selectedClusters[0];
            const darkerHex = `#${toHex(primary.r * 0.7)}${toHex(primary.g * 0.7)}${toHex(primary.b * 0.7)}`;
            const lighterHex = `#${toHex(primary.r + (255 - primary.r) * 0.35)}${toHex(primary.g + (255 - primary.g) * 0.35)}${toHex(primary.b + (255 - primary.b) * 0.35)}`;

            if (!selectedColors.includes(darkerHex) && selectedColors.length < maxColors) {
              selectedColors.push(darkerHex);
            }
            if (!selectedColors.includes(lighterHex) && selectedColors.length < maxColors) {
              selectedColors.push(lighterHex);
            }
          }

          // Fallback if empty
          if (selectedColors.length === 0) {
            return resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
          }

          resolve(selectedColors.slice(0, maxColors));
        } catch (err) {
          console.warn('Canvas color extraction error, using fallback:', err);
          resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
        }
      };

      img.onload = handleImageLoad;
      img.onerror = (e) => {
        console.warn('Image load error during color extraction:', e);
        resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
          }
        };
        reader.readAsDataURL(imageSource);
      }
    } catch {
      resolve(['#0284c7', '#0f172a', '#38bdf8', '#64748b']);
    }
  });
}

