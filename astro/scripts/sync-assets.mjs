import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const source = path.resolve(root, '..', 'assets');
const destination = path.resolve(root, 'public', 'assets');

if (!fs.existsSync(source)) {
  console.error(`[sync:assets] Source introuvable: ${source}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true, force: true });

console.log(`[sync:assets] Copie terminée: ${source} -> ${destination}`);
