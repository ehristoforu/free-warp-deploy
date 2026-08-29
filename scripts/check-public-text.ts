import { readFile } from 'node:fs/promises';
const files = ['README.md', 'public/index.html', 'public/app.js', 'SECURITY.md', 'CONTRIBUTING.md'];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  if (/\bVPN\b/i.test(text)) throw new Error(`Forbidden public wording in ${file}`);
}
const readme = await readFile('README.md', 'utf8');
for (const required of [
  'Deploy with Vercel',
  'Deploy to Netlify',
  'Конфиденциальность',
  'Ограничения',
  'GPL-3.0',
])
  if (!readme.includes(required)) throw new Error(`README missing ${required}`);
