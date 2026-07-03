"""Render SVG to PNG using Chrome headless, then generate all icon sizes."""

import subprocess
import os
import sys
from pathlib import Path

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE = Path(__file__).resolve().parents[1]

FULL_SVG = Path(r"C:\Users\Admin\Downloads\logo.svg")
IOS_ASSETS = BASE / "ios" / "Runner" / "Assets.xcassets" / "AppIcon.appiconset"
ANDROID_RES = BASE / "android" / "app" / "src" / "main" / "res"

def render_svg(svg_path, out_png, width, height):
    """Render SVG to PNG at given size using Chrome headless."""
    svg_path = Path(svg_path).resolve()
    out_png = Path(out_png).resolve()
    out_png.parent.mkdir(parents=True, exist_ok=True)

    html = f"""<html><body style="margin:0;background:#D97757">
<img src="file:///{svg_path.as_posix()}" width="{width}" height="{height}"/>
</body></html>"""
    html_file = out_png.parent / "_render.html"
    html_file.write_text(html)

    result = subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--disable-software-rasterizer",
        f"--screenshot={out_png}",
        f"--window-size={width},{height+40}",
        "--default-background-color=D97757",
        f"file:///{html_file.as_posix()}"
    ], capture_output=True, text=True, timeout=30)

    html_file.unlink(missing_ok=True)
    return out_png.exists()

def generate_android_legacy():
    """Generate Android legacy PNG icons from the full logo SVG."""
    sizes = [
        ("mipmap-mdpi", 48),
        ("mipmap-hdpi", 72),
        ("mipmap-xhdpi", 96),
        ("mipmap-xxhdpi", 144),
        ("mipmap-xxxhdpi", 192),
    ]
    for folder, size in sizes:
        out = ANDROID_RES / folder / "ic_launcher.png"
        print(f"  Rendering {folder} ({size}px)...", end=" ")
        if render_svg(FULL_SVG, out, size, size):
            print("OK")
        else:
            print("FAIL")

def generate_ios():
    """Generate iOS PNG icons."""
    sizes = [
        ("20", "1x", 20),
        ("20", "2x", 40),
        ("20", "3x", 60),
        ("29", "1x", 29),
        ("29", "2x", 58),
        ("29", "3x", 87),
        ("40", "1x", 40),
        ("40", "2x", 80),
        ("40", "3x", 120),
        ("60", "2x", 120),
        ("60", "3x", 180),
        ("76", "1x", 76),
        ("76", "2x", 152),
        ("83.5", "2x", 167),
        ("1024", "1x", 1024),
    ]
    for idiom, scale, px in sizes:
        scale_num = scale.replace("x", "")
        filename = f"AppIcon-{idiom}@x{scale_num}.png" if idiom != "1024" else "AppIcon-1024@1x.png"
        out = IOS_ASSETS / filename
        print(f"  Rendering {filename} ({px}px)...", end=" ")
        if render_svg(FULL_SVG, out, px, px):
            print("OK")
        else:
            print("FAIL")

    # Update Contents.json
    import json
    contents = IOS_ASSETS / "Contents.json"
    if contents.exists():
        data = json.loads(contents.read_text())
        images = []
        for idiom, scale, px in sizes:
            scale_num = scale.replace("x", "")
            filename = f"AppIcon-{idiom}@x{scale_num}.png" if idiom != "1024" else "AppIcon-1024@1x.png"
            entry = {"filename": filename, "scale": scale}
            if idiom == "1024":
                entry["idiom"] = "ios-marketing"
                entry["size"] = "1024x1024"
            else:
                entry["idiom"] = "iphone" if int(float(idiom)) <= 60 else "ipad"
                entry["size"] = f"{idiom}x{idiom}"
            images.append(entry)
        data["images"] = images
        contents.write_text(json.dumps(data, indent=2))
        print("  Contents.json updated")

if __name__ == "__main__":
    print("=== Android Legacy PNGs ===")
    generate_android_legacy()
    print()
    print("=== iOS Icons ===")
    generate_ios()
    print()
    print("Done.")
