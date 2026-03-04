import type { APIRoute } from 'astro';
import { LOCAL_CITY_PAGES } from '../data/local-cities';

const staticPaths = ['', 'detailing-auto-caen', 'detailing-auto-deauville', 'detailing-auto-autour-caen', 'mentions-legales'];
const cityPaths = LOCAL_CITY_PAGES.map((city) => `detailing-auto/${city.slug}`);
const paths = [...staticPaths, ...cityPaths];

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
