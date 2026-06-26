const { copyFileSync, existsSync, mkdirSync, readdirSync } = require('fs');
const { resolve, join } = require('path');

const src = resolve(__dirname, '..');
const distComponents = resolve(src, 'dist', 'components');
const components = resolve(src, 'components');

if (!existsSync(distComponents)) {
  mkdirSync(distComponents, { recursive: true });
}

const cssFiles = readdirSync(components).filter(f => f.endsWith('.css'));
for (const f of cssFiles) {
  copyFileSync(join(components, f), join(distComponents, f));
  console.log(`  ✓ ${f}`);
}
console.log(`Copied ${cssFiles.length} CSS file(s) to dist/components/`);
