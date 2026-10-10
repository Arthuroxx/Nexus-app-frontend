import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(projectRoot, '.env');
const examplePath = resolve(projectRoot, '.env.example');
const outputPath = resolve(projectRoot, 'public', 'env.js');

function parseEnvFile(path) {
  const entries = {};
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const separator = line.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }
  return entries;
}

const sourcePath = existsSync(envPath) ? envPath : examplePath;

if (!existsSync(sourcePath)) {
  console.error(
    '[generate-env] No se encontro ".env" ni ".env.example". Crea un archivo ".env" en la raiz del proyecto.',
  );
  process.exit(1);
}

const toCamelCase = (key) =>
  key.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, character) => character.toUpperCase());

const entries = Object.entries(parseEnvFile(sourcePath));
const sourceName = sourcePath === envPath ? '.env' : '.env.example';

const body = entries
  .map(([key, value]) => `  ${toCamelCase(key)}: ${JSON.stringify(value)},`)
  .join('\n');

const output = `/* ARCHIVO AUTO-GENERADO — NO EDITAR A MANO.
   Generado a partir de ${sourceName} por scripts/generate-env.mjs.
   Edita tu .env y vuelve a ejecutar "npm run generate:env" (o cualquier script de build/serve/test). */
window.__nexusEnv = {
${body}
};
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output, 'utf8');
console.log(`[generate-env] ${outputPath} generado a partir de ${sourcePath}`);
