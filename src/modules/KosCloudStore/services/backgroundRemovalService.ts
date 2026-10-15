/**
 * High-Performance Client-Side Background Removal & Transparency Service
 * Converts solid, white, light, or colored backgrounds to transparent PNG/WebP
 * with edge feathering and flood-fill alpha masking.
 */

export interface BackgroundRemovalOptions {
  tolerance?: number; // 1 to 100 (default: 20)
  feather?: number; // 0 to 10 (default: 2)
  targetColor?: { r: number; g: number; b: number } | null; // null = auto detect from corners
  floodFillOnly?: boolean; // If true, only removes background connected to edges (protects inside colors)
}

export interface BackgroundRemovalResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  detectedColor: { r: number; g: number; b: number; hex: string };
}

export class BackgroundRemovalService {
  /**
   * Automatically removes background from image and returns transparent PNG
   */
  public static async removeBackground(
    source: string | HTMLImageElement | File | Blob,
    options: BackgroundRemovalOptions = {}
  ): Promise<BackgroundRemovalResult> {
    const {
      tolerance = 20,
      feather = 2,
      targetColor = null,
      floodFillOnly = true,
    } = options;

    const img = await this.loadImage(source);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable');
    }

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 1. Detect background color if not provided
    const bg = targetColor || this.detectBackgroundColor(data, width, height);

    // 2. Build alpha mask
    const totalPixels = width * height;
    const mask = new Uint8Array(totalPixels); // 0 = transparent, 255 = keep

    // Normalized tolerance distance in RGB (0 - 441.67)
    const maxDist = (tolerance / 100) * 442;
    const featherDist = (feather / 10) * 40;

    if (floodFillOnly) {
      // Flood-fill BFS starting from 4 corners and borders
      const visited = new Uint8Array(totalPixels);
      const queue: number[] = [];

      // Add borders to queue
      for (let x = 0; x < width; x++) {
        queue.push(x); // top
        queue.push((height - 1) * width + x); // bottom
        visited[x] = 1;
        visited[(height - 1) * width + x] = 1;
      }
      for (let y = 0; y < height; y++) {
        const leftIdx = y * width;
        const rightIdx = y * width + (width - 1);
        if (!visited[leftIdx]) {
          queue.push(leftIdx);
          visited[leftIdx] = 1;
        }
        if (!visited[rightIdx]) {
          queue.push(rightIdx);
          visited[rightIdx] = 1;
        }
      }

      // Initialize mask to 255 (opaque)
      mask.fill(255);

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        const px = curr % width;
        const py = Math.floor(curr / width);
        const offset = curr * 4;

        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        // Euclidean distance in RGB
        const dr = r - bg.r;
        const dg = g - bg.g;
        const db = b - bg.b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= maxDist + featherDist) {
          if (dist <= maxDist) {
            mask[curr] = 0; // Pure transparent
          } else {
            // Feathered edge
            const ratio = (dist - maxDist) / featherDist;
            mask[curr] = Math.round(ratio * 255);
          }

          // Check 4-connected neighbors
          const neighbors = [
            px > 0 ? curr - 1 : -1,
            px < width - 1 ? curr + 1 : -1,
            py > 0 ? curr - width : -1,
            py < height - 1 ? curr + width : -1,
          ];

          for (const n of neighbors) {
            if (n >= 0 && !visited[n]) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }
      }
    } else {
      // Global color threshold
      for (let i = 0; i < totalPixels; i++) {
        const offset = i * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        const dr = r - bg.r;
        const dg = g - bg.g;
        const db = b - bg.b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= maxDist) {
          mask[i] = 0;
        } else if (dist <= maxDist + featherDist) {
          mask[i] = Math.round(((dist - maxDist) / featherDist) * 255);
        } else {
          mask[i] = 255;
        }
      }
    }

    // 3. Apply mask to pixel alpha
    for (let i = 0; i < totalPixels; i++) {
      const offset = i * 4;
      const alpha = mask[i];
      if (alpha === 0) {
        data[offset + 3] = 0;
      } else if (alpha < 255) {
        data[offset + 3] = Math.min(data[offset + 3], alpha);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const hex = `#${((1 << 24) + (bg.r << 16) + (bg.g << 8) + bg.b).toString(16).slice(1)}`;

    return {
      dataUrl,
      blob,
      width,
      height,
      detectedColor: { ...bg, hex },
    };
  }

  /**
   * Helper to sample the 4 corners of an image and calculate the predominant background color
   */
  private static detectBackgroundColor(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): { r: number; g: number; b: number } {
    const samplePoints = [
      0, // Top-left
      (width - 1) * 4, // Top-right
      (height - 1) * width * 4, // Bottom-left
      ((height - 1) * width + (width - 1)) * 4, // Bottom-right
      Math.floor(width / 2) * 4, // Top-center
      (height - 1) * width * 4 + Math.floor(width / 2) * 4, // Bottom-center
    ];

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let validSamples = 0;

    for (const offset of samplePoints) {
      if (offset >= 0 && offset + 2 < data.length) {
        sumR += data[offset];
        sumG += data[offset + 1];
        sumB += data[offset + 2];
        validSamples++;
      }
    }

    if (validSamples === 0) return { r: 255, g: 255, b: 255 };

    return {
      r: Math.round(sumR / validSamples),
      g: Math.round(sumG / validSamples),
      b: Math.round(sumB / validSamples),
    };
  }

  /**
   * Loads image from various source formats into HTMLImageElement
   */
  private static loadImage(source: string | HTMLImageElement | File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Document not available'));
        return;
      }

      if (source instanceof HTMLImageElement && source.complete) {
        resolve(source);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load image for background removal: ' + e));

      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        img.src = URL.createObjectURL(source);
      } else if (source instanceof HTMLImageElement) {
        img.src = source.src;
      }
    });
  }
}
