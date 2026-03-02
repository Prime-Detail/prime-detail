import type { APIRoute } from 'astro';

const paths = ['', 'detailing-auto-caen', 'mentions-legales'];

export const GET: APIRoute = ({ site }) => {
  const baseSite = site?.toString() ?? 'https://prime-detail.github.io/prime-detail/';

  const urls = paths
    .map((path) => {
      const loc = new URL(path, baseSite).toString();
      return `<url><loc>${loc}</loc></url>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
