# 离线 GLB 模型体检工具

给城市纹理接入建筑模型前使用的开发辅助工具。输出中文 JSON/HTML 报告，检查有限范围的自包含静态 GLB，提供本地三维预览和可复跑实验。工具版本为 0.5.0，与主应用版本独立。

## 开始使用

需要 Node.js 22+，运行时不需要安装依赖。从仓库根目录执行：

    npm run test:models
    npm run model:inspect -- --input "模型.glb" --out ".runtime/模型报告"

测试入口会先从本仓库 dist/data/landmark-eiffel.js 离线还原铁塔到本目录基线/eiffel.glb，严格核对 5,696,248 字节及固定 SHA-256。该生成文件不重复提交；若已有文件内容不同会停止，不覆盖。

打开预览，在本工具目录执行：

    npm start

或执行 npm run server，然后打开 http://127.0.0.1:5173/index.html，选择本地 GLB。模型只在本机处理。预览前与 CLI 使用同一份准入规则，不依赖 CDN。

## 检查与口径

- 区分 mesh 几何、默认场景实例及 POSITION 记录数。
- 按实际顶点和节点变换计算世界范围；全图检查环、多父、深度和变换溢出。
- 检查容器、引用、逻辑 buffer 容量、索引、常用材质贴图引用与有限坐标。
- 错误或不支持时几何指标不可用，CLI 非 0；默认拒绝覆盖报告。
- 准入、预览和 CLI 共用规则。图片宽高来自可识别的头部，不等同于完整图像解码验证。

这是有限支持的检查器，不是 Khronos 官方 Validator。稀疏、骨骼、动画和压缩扩展等按支持范围拒绝。详见使用说明.md和实现参考与支持范围.md。

## 复核

仓库根目录：

    npm run test:models
    npm run test:models:browser

浏览器检查需要本机 Chrome；可用 CHROME_PATH 指定路径。CI 使用真实 Chrome 的软件 WebGL，手机为视口模拟。源码整合前的最终验收为 507 项命令行、96 项浏览器断言，整合后以本提交 Actions 为准。

本工具目录：

    npm run vendor:verify
    npm run pack

vendor 校验只读，不匹配时非 0。pack 可生成包含基线的独立工具目录和逐文件清单，排除缓存。生成物不重复提交。详细操作见使用说明.md。

## 实验、来源与边界

性能实验报告.md、measure/fps-raw.json、汇总及截图归档了 2026-10-19 的六轮实验。它们是指定浏览器配置下的 rAF 间隔，不代表 GPU 耗时、真实手机性能或本次源码修改后的重新采样。南京紫峰模型尚未取得，评估只保留有来源的公开元数据。

工具由 WorkBuddy 协作实现，Codex 独立验收并补齐中心/范围溢出回归；整合保留独立目录。程序遵循仓库 MIT；Three.js 0.186.0 / MIT 全文和哈希在预览/vendor；铁塔 © SDC / CC BY 4.0，见基线/来源.json和基线/模型许可.md。
