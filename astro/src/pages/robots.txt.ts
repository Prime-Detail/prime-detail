import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const baseSite = site?.toString() ?? 'https://prime-detail.github.io/prime-detail/';
  const sitemap = new URL('sitemap.xml', baseSite).toString();
  const mediaSitemap = new URL('sitemap-media.xml', baseSite).toString();

  const body = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${sitemap}`,
    `Sitemap: ${mediaSitemap}`
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
