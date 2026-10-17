// 仅开发构建需要 npm ci；发行版已包含本地三维运行代码。
const path = require('node:path');
require('esbuild').buildSync({ entryPoints: [path.resolve(__dirname, '../src/landmarks.js')],
  outfile: path.resolve(__dirname, '../dist/landmarks.js'), bundle: true, minify: true, format: 'iife', target: 'chrome110',
  legalComments: 'inline', charset: 'utf8' });
console.log('三维展台已打包为本地 IIFE，无 CDN、模块导入或模型接口依赖。');
