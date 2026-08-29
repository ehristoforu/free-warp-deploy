import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import prettier from 'prettier';
import { buildRegistry } from './endpoint-registry-builder.js';
const reportPath = 'data/warpscout-report.txt';
const outputPath = 'src/generated/endpoint-registry.ts';
const report = await readFile(reportPath, 'utf8');
if (report.includes('Add a WARPSCOUT report here')) {
  throw new Error('Replace data/warpscout-report.txt with a real WARPSCOUT report');
}
const reportStat = await stat(reportPath);
const registry = buildRegistry(report, reportStat.mtime);
await mkdir('src/generated', { recursive: true });
const source = await prettier.format(
  `import type { EndpointRegistry } from '../domain/warpscout/endpoint.js';\n\nexport const endpointRegistry: EndpointRegistry = ${JSON.stringify(registry, null, 2)};\n`,
  { parser: 'typescript', semi: true, singleQuote: true, printWidth: 100 },
);
if (process.argv.includes('--check')) {
  let current: string;
  try {
    current = await readFile(outputPath, 'utf8');
  } catch {
    throw new Error('Generated endpoint registry is missing');
  }
  const currentData = current.replace(
    /"generatedAt": ".*?"|"verifiedAt": ".*?"|"expiresAt": ".*?"/g,
    'timestamp: dynamic',
  );
  const expectedData = source.replace(
    /"generatedAt": ".*?"|"verifiedAt": ".*?"|"expiresAt": ".*?"/g,
    'timestamp: dynamic',
  );
  if (currentData !== expectedData) throw new Error('Generated endpoint registry is out of date');
} else {
  await writeFile(outputPath, source);
}
