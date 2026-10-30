import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');
const srcMigrationsDir = path.join(serverRoot, 'src', 'database', 'migrations');
const distMigrationsDir = path.join(distDir, 'database', 'migrations');

function walkJsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(full, out);
    } else if (entry.isFile() && full.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function resolveImportTarget(fromFile, spec) {
  if (!spec.startsWith('./') && !spec.startsWith('../')) return spec;
  if (/\.(js|mjs|cjs|json)$/i.test(spec)) return spec;
  const fromDir = path.dirname(fromFile);
  const absCandidate = path.resolve(fromDir, spec);
  if (fs.existsSync(`${absCandidate}.js`)) {
    return `${spec}.js`;
  }
  if (fs.existsSync(path.join(absCandidate, 'index.js'))) {
    return `${spec.replace(/\/$/, '')}/index.js`;
  }
  return `${spec}.js`;
}

for (const jsFile of walkJsFiles(distDir)) {
  const original = fs.readFileSync(jsFile, 'utf8');
  const updated = original
    .replace(/(from\s+['"])(\.\.?\/[^'"]+)(['"])/g, (_m, prefix, spec, suffix) => {
      return `${prefix}${resolveImportTarget(jsFile, spec)}${suffix}`;
    })
    .replace(/(import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g, (_m, prefix, spec, suffix) => {
      return `${prefix}${resolveImportTarget(jsFile, spec)}${suffix}`;
    });
  if (updated !== original) {
    fs.writeFileSync(jsFile, updated, 'utf8');
  }
}

if (fs.existsSync(srcMigrationsDir)) {
  fs.mkdirSync(distMigrationsDir, { recursive: true });
  for (const file of fs.readdirSync(srcMigrationsDir)) {
    if (file.endsWith('.sql')) {
      fs.copyFileSync(
        path.join(srcMigrationsDir, file),
        path.join(distMigrationsDir, file),
      );
    }
  }
}
