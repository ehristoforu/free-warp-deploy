import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? files(join(dir, e.name))
          : e.name.endsWith('.ts')
            ? [join(dir, e.name)]
            : [],
      ),
    )
  ).flat();
}
const source = (await files('src')).map((file) => file.replaceAll('\\', '/'));
const text = await Promise.all(source.map(async (f) => [f, await readFile(f, 'utf8')] as const));
const required = [
  'src/application',
  'src/domain',
  'src/infrastructure',
  'src/presentation',
  'src/shared',
];
for (const path of required)
  if (!source.some((f) => f.startsWith(path)))
    throw new Error(`Missing architecture layer: ${path}`);
for (const [file, content] of text) {
  if (/process\.env/.test(content) && file !== 'src/config.ts')
    throw new Error(`Environment access outside config: ${file}`);
  if (/(private.?key|token|generated config)/i.test(content) && /console\./.test(content))
    throw new Error(`Sensitive logging in ${file}`);
  if (file.includes('domain') && /(presentation|platform|vercel|netlify)/i.test(content))
    throw new Error(`Invalid domain dependency: ${file}`);
}
