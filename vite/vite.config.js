import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('./src/userscript-header.txt', import.meta.url), 'utf8').trimEnd();

function textTemplate() {
  const PREFIX = '\0tpl:';
  return {
    name: 'text-template',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith('?tpl')) return null;
      const resolved = await this.resolve(source.slice(0, -4), importer, { skipSelf: true });
      return resolved ? PREFIX + resolved.id + '.js' : null;
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const file = id.slice(PREFIX.length, -3);
      this.addWatchFile(file);
      const body = readFileSync(file, 'utf8')
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${');
      return `export default \`${body}\`;`;
    },
  };
}

export default defineConfig({
  plugins: [textTemplate()],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    copyPublicDir: false,
    outDir: 'dist',
    lib: {
      entry: 'src/main.js',
      formats: ['iife'],
      name: 'EtisReborn',
      fileName: () => 'etis.user.js',
    },
    rollupOptions: {
      output: { banner: header + '\n' },
    },
  },
});
