export const prerender = true;

export function GET() {
  return new Response('google-site-verification: google66b58e4d504a4285.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
