// 生成可直接双击打开的单文件；数据随页面保存，没有 CDN 或在线接口依赖。
const fs = require('node:fs/promises');
const path = require('node:path');
async function build(output = path.resolve(__dirname, '../.runtime/城市纹理-第三阶段预览.html')) {
  const root = path.resolve(__dirname, '../dist');
  let html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  html = html.replace('href="./index.html"', 'href="#"');
  html = html.replace('<link rel="icon" href="favicon.svg" type="image/svg+xml">', '');
  html = html.replace('<link rel="stylesheet" href="style.css">', () => 'STYLE_PLACEHOLDER');
  html = html.replace('STYLE_PLACEHOLDER', () => `<style>${require('node:fs').readFileSync(path.join(root, 'style.css'), 'utf8')}</style>`);
  for (const src of ['data/zurich.js', 'data/bern.js', 'data/zurich-buildings.js', 'data/bern-buildings.js', 'core.js', 'app.js']) {
    const code = (await fs.readFile(path.join(root, src), 'utf8')).replace(/<\/script/gi, '<\\/script');
    // 原脚本在 head 中 defer 执行；单文件脚本移至 body 末尾，保留 DOM 可用顺序。
    html = html.replace(`<script defer src="${src}"></script>`, '');
    html = html.replace('</body>', () => `<script>${code}</script>\n</body>`);
  }
  await fs.mkdir(path.dirname(output), { recursive: true }); await fs.writeFile(output, html);
  return output;
}
module.exports = { build };
if (require.main === module) build(process.argv[2]).then(p => console.log(p)).catch(e => { console.error(e); process.exitCode = 1; });
