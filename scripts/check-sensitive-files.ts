import { readdir, readFile } from 'node:fs/promises';
const files = await readdir('.', { recursive: true });
for (const file of files) {
  if (file.includes('node_modules') || file.includes('.git')) continue;
  if (/\.env($|\.)/.test(file) && file !== '.env.example')
    throw new Error(`Environment file detected: ${file}`);
  if (/\.conf$|\.pem$|\.key$/.test(file)) throw new Error(`Sensitive file detected: ${file}`);
  if (file.endsWith('.md') || file.endsWith('.ts') || file.endsWith('.js')) {
    if (file.endsWith('check-sensitive-files.ts')) continue;
    const text = await readFile(file, 'utf8');
    if (/-----BEGIN|Bearer\s+[A-Za-z0-9._-]{20,}/.test(text))
      throw new Error(`Secret-like value detected: ${file}`);
  }
}
