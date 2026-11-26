import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function localWebsiteScraperPlugin(): Plugin {
  return {
    name: 'kosai-local-website-scraper',
    configureServer(server) {
      server.middlewares.use('/api/local-scrape', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });
        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}');
            const rawUrl = String(body.url || '').trim();
            if (!rawUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
              return;
            }

            const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
            const parsedUrl = new URL(normalizedUrl);
            const host = parsedUrl.hostname.toLowerCase();
            if (
              host === 'localhost' ||
              host === '127.0.0.1' ||
              host === '0.0.0.0' ||
              host === '::1' ||
              host.startsWith('10.') ||
              host.startsWith('192.168.') ||
              host.startsWith('169.254.') ||
              /^172\.(1[6-9]|2\d|3[01])\./.test(host)
            ) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Internal hosts not allowed' }));
              return;
            }

            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 12000);
            const pageRes = await fetch(parsedUrl.toString(), {
              method: 'GET',
              redirect: 'follow',
              signal: ctrl.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
              },
            });
            clearTimeout(timer);

            if (!pageRes.ok) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: `האתר החזיר שגיאה (${pageRes.status})` }));
              return;
            }

            const html = (await pageRes.text()).slice(0, 450000);

            let cssText = '';
            const cssLinks = Array.from(
              html.matchAll(/<link[^>]+rel=["'][^"']*stylesheet[^"']*["'][^>]+href=["']([^"']+)["']/gi)
            )
              .map((m) => m[1])
              .filter((href) => href && !href.includes('fonts.googleapis.com'))
              .slice(0, 4);

            for (const cssHref of cssLinks) {
              try {
                const resolvedHref = cssHref.startsWith('//') ? `${parsedUrl.protocol}${cssHref}` : cssHref;
                const cssUrl = new URL(resolvedHref, parsedUrl.origin).toString();
                const cssCtrl = new AbortController();
                const cssTimer = setTimeout(() => cssCtrl.abort(), 3500);
                const cssResp = await fetch(cssUrl, { signal: cssCtrl.signal });
                clearTimeout(cssTimer);
                if (cssResp.ok) {
                  cssText += '\n' + (await cssResp.text()).slice(0, 150000);
                }
              } catch {
                // ignore optional css fetch errors
              }
            }

            const combined = html + '\n' + cssText;
            const getMeta = (pattern: RegExp) => html.match(pattern)?.[1]?.trim() || '';

            const title = getMeta(/<title[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+/g, ' ');
            const description =
              getMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
              getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
            const ogTitle = getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
            const ogDescription = getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
            const ogImageRaw = getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
            const themeColor = getMeta(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i);
            const faviconRaw = getMeta(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i);

            const resolveAsset = (raw: string) => {
              if (!raw) return '';
              try {
                return new URL(raw, parsedUrl.origin).toString();
              } catch {
                return raw;
              }
            };

            const colorCounts = new Map<string, number>();
            for (const hex of combined.match(/#[0-9a-fA-F]{6}\b/g) || []) {
              const norm = hex.toLowerCase();
              colorCounts.set(norm, (colorCounts.get(norm) || 0) + 1);
            }
            const topColors = Array.from(colorCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 24)
              .map(([hex, count]) => ({ hex, count }));

            const cssVars: Record<string, string> = {};
            for (const m of combined.matchAll(
              /--([a-zA-Z0-9_-]*(?:color|primary|secondary|accent|bg|background|text|brand)[a-zA-Z0-9_-]*)\s*:\s*([^;}{]+)/gi
            )) {
              const val = m[2].trim();
              if (Object.keys(cssVars).length < 30 && !val.startsWith('var(')) {
                cssVars[`--${m[1]}`] = val;
              }
            }

            const fontSet = new Set<string>();
            for (const m of html.matchAll(/fonts\.googleapis\.com\/css2?\?[^"']*family=([^"'&]+)/gi)) {
              fontSet.add(decodeURIComponent(m[1]).split(':')[0].replace(/\+/g, ' '));
            }
            for (const m of combined.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
              const firstFont = m[1].split(',')[0].replace(/["']/g, '').trim();
              if (firstFont && !/^(inherit|initial|unset|sans-serif|serif|monospace|system-ui)$/i.test(firstFont)) {
                fontSet.add(firstFont);
              }
              if (fontSet.size >= 8) break;
            }

            const radiiSet = new Set<string>();
            for (const m of combined.matchAll(/border-radius\s*:\s*([^;}{]+)/gi)) {
              radiiSet.add(m[1].trim());
              if (radiiSet.size >= 10) break;
            }

            // Strip header/nav/footer for main body content extraction so we don't just read the header!
            const bodyWithoutChrome = html
              .replace(/<script[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style[\s\S]*?<\/style>/gi, ' ')
              .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
              .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
              .replace(/<header[\s\S]*?<\/header>/gi, ' ')
              .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
              .replace(/<footer[\s\S]*?<\/footer>/gi, ' ');

            const headings: string[] = [];
            for (const m of bodyWithoutChrome.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)) {
              const clean = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              if (clean && clean.length > 2 && clean.length < 180 && !headings.includes(clean)) {
                headings.push(clean);
              }
              if (headings.length >= 20) break;
            }

            const ctaTexts: string[] = [];
            for (const m of bodyWithoutChrome.matchAll(/<(?:button|a)[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)) {
              const clean = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              if (clean && clean.length >= 2 && clean.length <= 45 && !ctaTexts.includes(clean)) {
                ctaTexts.push(clean);
              }
              if (ctaTexts.length >= 16) break;
            }

            const visibleText = bodyWithoutChrome
              .replace(/<[^>]+>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 6000);

            const structureCues = {
              hasHeader: /<header\b/i.test(html),
              hasNav: /<nav\b/i.test(html),
              hasHero: /hero|banner|jumbotron/i.test(html),
              hasGridOrCards: /grid|bento|card|cards|elementor-grid/i.test(combined),
              hasTestimonials: /testimonial|review|המלצות|לקוחות מספרים/i.test(html),
              hasPricing: /pricing|plan|מחיר|חבילות|מסלולים/i.test(html),
              hasFaq: /faq|שאלות ותשובות|שאלות נפוצות/i.test(html),
              hasForm: /<form\b/i.test(html),
              hasFooter: /<footer\b/i.test(html),
            };

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                url: parsedUrl.toString(),
                domain: host,
                meta: {
                  title,
                  description,
                  ogTitle,
                  ogDescription,
                  ogImage: resolveAsset(ogImageRaw),
                  themeColor,
                  favicon: resolveAsset(faviconRaw),
                },
                designSignals: {
                  topColors,
                  cssVars,
                  fonts: Array.from(fontSet),
                  borderRadii: Array.from(radiiSet),
                  structureCues,
                },
                contentSignals: {
                  headings,
                  ctaTexts,
                  visibleText,
                },
              })
            );
          } catch (err: any) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: err?.name === 'AbortError' ? 'פג זמן ההמתנה לטעינת האתר' : err?.message || 'שגיאה בסריקה',
              })
            );
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), localWebsiteScraperPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/ConnectToKesher': {
        target: 'https://kesherhk.info',
        changeOrigin: true,
        secure: false,
      },
      '/KesherAPI': {
        target: 'https://kesherhk.info',
        changeOrigin: true,
        secure: false,
      },
      '/api/heygen': {
        target: 'https://api.heygen.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/heygen/, ''),
        secure: false,
      },
      '/upload/heygen': {
        target: 'https://upload.heygen.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload\/heygen/, ''),
        secure: false,
      },
    },
  },
});
