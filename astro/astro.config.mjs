import { defineConfig } from 'astro/config';

const repository = process.env.GITHUB_REPOSITORY || '';
const repoName = repository.split('/')[1] || '';
const isUserPages = repoName.endsWith('.github.io');

const site = repository
  ? `https://${repository.split('/')[0]}.github.io${isUserPages ? '' : `/${repoName}`}`
  : undefined;

const base = repository ? (isUserPages ? '/' : `/${repoName}/`) : '/';

export default defineConfig({
  output: 'static',
  site,
  base
});