"""生成可直接使用的 GitHub Release 资产；仅标准库，内容与固定源码提交关联。"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def package(commit: str, output: Path | None = None, node: str | None = None) -> Path:
    if not re.fullmatch(r"[a-f0-9]{40}", commit):
        raise ValueError("请提供完整的 40 位源码提交 SHA")
    version = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", version):
        raise ValueError("版本号格式无效")
    release_dir = output or ROOT / ".runtime" / "releases" / f"v{version}"
    release_dir.mkdir(parents=True, exist_ok=True)
    executable = node or shutil.which("node")
    if not executable:
        raise ValueError("打包时需要 Node.js；使用发行版不需要安装它")
    # GitHub 会改写非 ASCII 附件名；下载文件名保持稳定，包内入口和文档使用中文。
    html_name = f"city-texture-v{version}.html"
    zip_name = f"city-texture-v{version}-offline.zip"
    guide_name = f"usage-v{version}.md"
    info_name = f"version-v{version}.json"
    checksum_name = f"SHA256SUMS-v{version}.txt"
    html_path = release_dir / html_name
    subprocess.run([executable, str(ROOT / "scripts" / "build-standalone.cjs"), str(html_path)], check=True)
    guide = (ROOT / "docs" / "使用说明.md").read_text(encoding="utf-8")
    if f"v{version}" not in guide:
        raise ValueError("使用说明的版本号需要与 package.json 一致")
    license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
    data_license = (ROOT / "数据许可.md").read_text(encoding="utf-8")
    sample_guide = (ROOT / "docs" / "样本包格式与导入.md").read_text(encoding="utf-8")
    project_guide = (ROOT / "docs" / "比较项目格式与恢复.md").read_text(encoding="utf-8")
    landmark_guide = (ROOT / "docs" / "三维建筑使用说明.md").read_text(encoding="utf-8")
    workbench_guide = (ROOT / "docs" / "建筑工作台使用说明.md").read_text(encoding="utf-8")
    workbench_format = (ROOT / "docs" / "建筑工作台格式.md").read_text(encoding="utf-8")
    model_license = (ROOT / "模型许可.md").read_text(encoding="utf-8")
    three_license = (ROOT / "licenses" / "three-MIT.txt").read_text(encoding="utf-8")
    info = dict(app="城市纹理", version=version, sourceCommit=commit,
                sourceUrl=f"https://github.com/LouHC0814/city-texture/tree/{commit}",
                appLicense="MIT", mapDataLicense="ODbL-1.0", runtime="浏览器；无需安装依赖")
    info_text = json.dumps(info, ensure_ascii=False, indent=2) + "\n"
    # 单文件也保留程序许可与版本来源，不将这些内容加入产品操作界面。
    html = html_path.read_text(encoding="utf-8")
    html += "\n<!--\n" + license_text.replace("--", "—") + "\n" + info_text + "\n" + three_license.replace("--", "—") + "\n" + model_license.replace("--", "—") + "-->\n"
    html_path.write_text(html, encoding="utf-8", newline="\n")
    (release_dir / guide_name).write_text(guide, encoding="utf-8", newline="\n")
    (release_dir / info_name).write_text(info_text, encoding="utf-8", newline="\n")
    folder = f"城市纹理-v{version}"
    contents = {"打开城市纹理.html": html.encode("utf-8"), "使用说明.md": guide.encode("utf-8"),
                "程序许可.txt": license_text.encode("utf-8"), "数据许可.md": data_license.encode("utf-8"),
                "版本信息.json": info_text.encode("utf-8"), "样本包格式与导入.md": sample_guide.encode("utf-8"),
                "比较项目格式与恢复.md": project_guide.encode("utf-8"), "三维建筑使用说明.md": landmark_guide.encode("utf-8"),
                "模型许可.md": model_license.encode("utf-8"), "Three.js许可.txt": three_license.encode("utf-8"),
                "建筑工作台使用说明.md": workbench_guide.encode("utf-8"), "建筑工作台格式.md": workbench_format.encode("utf-8")}
    with zipfile.ZipFile(release_dir / zip_name, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for name, data in contents.items():
            entry = zipfile.ZipInfo(f"{folder}/{name}", date_time=(2026, 1, 1, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, data, compresslevel=9)
    with zipfile.ZipFile(release_dir / zip_name) as archive:
        if archive.testzip() is not None or len(archive.namelist()) != len(contents):
            raise ValueError("发行包 ZIP 完整性检查失败")
        for name, data in contents.items():
            if archive.read(f"{folder}/{name}") != data:
                raise ValueError("发行包内容与单文件不一致")
    if re.search(r'<script\b[^>]*\bsrc\s*=', html, re.I) or re.search(r'<link\b[^>]*rel="stylesheet"', html, re.I):
        raise ValueError("单文件仍引用外部脚本或样式，不能作为离线发行版")
    assets = [html_name, zip_name, guide_name, info_name]
    checksums = "".join(f"{hashlib.sha256((release_dir / name).read_bytes()).hexdigest()}  {name}\n" for name in assets)
    (release_dir / checksum_name).write_text(checksums, encoding="utf-8", newline="\n")
    print(json.dumps(dict(version=version, commit=commit, output=str(release_dir), assets=assets + [checksum_name]), ensure_ascii=False), flush=True)
    return release_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--commit", required=True, help="与发行文件对应的完整源码提交 SHA")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--node", help="Node.js 解释器路径，仅打包需要")
    args = parser.parse_args()
    package(args.commit, args.output, args.node)
