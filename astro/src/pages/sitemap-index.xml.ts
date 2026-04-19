import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const baseSite = site?.toString() ?? 'https://prime-detail.github.io/prime-detail/';
  const now = new Date().toISOString();

  const sitemaps = [
    new URL('sitemap.xml', baseSite).toString(),
    new URL('sitemap-media.xml', baseSite).toString()
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps
    .map((loc) => `<sitemap><loc>${loc}</loc><lastmod>${now}</lastmod></sitemap>`)
    .join('')}</sitemapindex>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
