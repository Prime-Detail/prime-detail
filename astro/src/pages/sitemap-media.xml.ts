import type { APIRoute } from 'astro';
import { LOCAL_CITY_PAGES } from '../data/local-cities';

type MediaEntry = {
  path: string;
  images: string[];
  video?: {
    contentLoc: string;
    thumbnailLoc: string;
    title: string;
    description: string;
  };
};

const cityEntries: MediaEntry[] = LOCAL_CITY_PAGES.map((city) => ({
  path: `detailing-auto/${city.slug}`,
  images: [
    'assets/images/gallery/apres.jpeg',
    'assets/images/gallery/polissage.webp'
  ]
}));

const mediaEntries: MediaEntry[] = [
  {
    path: '',
    images: [
      'assets/images/gallery/apres.jpeg',
      'assets/images/gallery/polissage.webp',
      'assets/images/logo/logo2.png'
    ],
    video: {
      contentLoc: 'assets/videos/video-mobile.mp4',
      thumbnailLoc: 'assets/images/gallery/apres.jpeg',
      title: 'Detailing auto a domicile a Caen',
      description: 'Extrait reel d une prestation Prime Detail avec preparation, execution et rendu final.'
    }
  },
  {
    path: 'detailing-auto-caen',
    images: [
      'assets/images/gallery/apres.jpeg',
      'assets/images/gallery/polissage.webp'
    ]
  },
  {
    path: 'detailing-auto-deauville',
    images: [
      'assets/images/gallery/apres.jpeg',
      'assets/images/gallery/polissage.webp'
    ]
  },
  {
    path: 'detailing-auto-autour-caen',
    images: [
      'assets/images/gallery/apres.jpeg',
      'assets/images/gallery/polissage.webp'
    ]
  },
  ...cityEntries
];

function escXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = ({ site }) => {
  const baseSite = site?.toString() ?? 'https://prime-detail.github.io/prime-detail/';

  const urls = mediaEntries
    .map((entry) => {
      const loc = new URL(entry.path, baseSite).toString();
      const imagesXml = entry.images
        .map((imagePath) => {
          const imageLoc = new URL(imagePath, baseSite).toString();
          return `<image:image><image:loc>${escXml(imageLoc)}</image:loc></image:image>`;
        })
        .join('');

      const videoXml = entry.video
        ? `<video:video><video:thumbnail_loc>${escXml(new URL(entry.video.thumbnailLoc, baseSite).toString())}</video:thumbnail_loc><video:title>${escXml(entry.video.title)}</video:title><video:description>${escXml(entry.video.description)}</video:description><video:content_loc>${escXml(new URL(entry.video.contentLoc, baseSite).toString())}</video:content_loc></video:video>`
        : '';

      return `<url><loc>${escXml(loc)}</loc>${imagesXml}${videoXml}</url>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
