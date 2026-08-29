import { readFile } from 'node:fs/promises';
const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as {
  dependencies?: object;
  devDependencies?: object;
};
if (packageJson.dependencies && Object.keys(packageJson.dependencies).length)
  throw new Error('Runtime dependencies must remain minimal and explicit');
if (
  Object.keys(packageJson.devDependencies ?? {}).some((name) =>
    /react|next|vue|angular/i.test(name),
  )
)
  throw new Error('Unnecessary frontend framework dependency');
try {
  JSON.parse(await readFile('package-lock.json', 'utf8'));
} catch {
  throw new Error('package-lock.json is required');
}
