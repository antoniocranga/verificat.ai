"""Generate app icons for Android (adaptive XML) and iOS (PNG)."""

import cairosvg
import os
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
FOREGROUND_SVG = Path(r"C:\Users\Admin\Downloads\logo-foreground.svg")
FULL_LOGO_SVG = Path(r"C:\Users\Admin\Downloads\logo.svg")

ANDROID_RES = BASE / "android" / "app" / "src" / "main" / "res"
IOS_ASSETS = BASE / "ios" / "Runner" / "Assets.xcassets" / "AppIcon.appiconset"

def generate_android_adaptive():
    """Create Android adaptive icon XML files."""
    # Background drawable
    bg_dir = ANDROID_RES / "drawable"
    bg_dir.mkdir(parents=True, exist_ok=True)
    (bg_dir / "ic_launcher_background.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#D97757</color>
</resources>
""")

    # Foreground vector drawable from logo-foreground.svg
    fg_dir = ANDROID_RES / "drawable"
    fg_path = fg_dir / "ic_launcher_foreground.xml"

    # SVG paths: shield + checkmark, strokes only.
    fg_path.write_text("""<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="580"
    android:viewportHeight="580">
    <path
        android:fillColor="@android:color/transparent"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="28"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M483.33,314.17C483.33,435 398.75,495.42 298.22,530.46C292.95,532.24 287.23,532.16 282.03,530.22C181.25,495.42 96.67,435 96.67,314.17V145C96.67,138.59 99.21,132.44 103.75,127.91C108.28,123.38 114.42,120.83 120.83,120.83C169.17,120.83 229.58,91.83 271.63,55.10C276.75,50.73 283.27,48.32 290,48.32C296.73,48.32 303.25,50.73 308.37,55.10C350.66,92.07 410.83,120.83 459.17,120.83C465.58,120.83 471.72,123.38 476.26,127.91C480.79,132.44 483.33,138.59 483.33,145V314.17Z"/>
    <path
        android:fillColor="@android:color/transparent"
        android:strokeColor="#FFFFFF"
        android:strokeWidth="28"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="M217.5,290L265.83,338.33L362.5,241.67"/>
</vector>
""")
    print("[OK] Android foreground vector created")

    # Adaptive icon XML (v26+)
    anydpi = ANDROID_RES / "mipmap-anydpi-v26"
    anydpi.mkdir(parents=True, exist_ok=True)

    (anydpi / "ic_launcher.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
""")
    (anydpi / "ic_launcher_round.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
""")
    print("[OK] Android adaptive icons created (mipmap-anydpi-v26)")

    # Also set up a solid mipmap fallback via Python-generated PNG
    # Generate legacy ic_launcher pngs from the full logo
    return generate_legacy_pngs()


def generate_legacy_pngs():
    """Generate legacy PNG icons for Android densities from the full logo SVG."""
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    if not FULL_LOGO_SVG.exists():
        print("[SKIP] Full logo SVG not found, skipping legacy PNGs")
        return

    svg_content = FULL_LOGO_SVG.read_text(encoding="utf-8")
    for folder, size in sizes.items():
        out_dir = ANDROID_RES / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "ic_launcher.png"
        try:
            cairosvg.svg2png(
                bytestring=svg_content.encode("utf-8"),
                write_to=str(out_path),
                output_width=size,
                output_height=size,
            )
            print(f"  [OK] {folder}/ic_launcher.png ({size}px)")
        except Exception as e:
            print(f"  [FAIL] {folder}: {e}")


def generate_ios_icons():
    """Generate iOS PNG icons from the full logo SVG."""
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

    if not FULL_LOGO_SVG.exists():
        print("[SKIP] Full logo SVG not found, skipping iOS icons")
        return

    if not IOS_ASSETS.exists():
        print(f"[SKIP] iOS assets folder not found at {IOS_ASSETS}")
        return

    svg_content = FULL_LOGO_SVG.read_text(encoding="utf-8")
    for idiom, scale, px in sizes:
        filename = f"AppIcon-{idiom}@x{scale.replace('x','')}.png" if idiom != "1024" else "AppIcon-1024@1x.png"
        out_path = IOS_ASSETS / filename
        try:
            cairosvg.svg2png(
                bytestring=svg_content.encode("utf-8"),
                write_to=str(out_path),
                output_width=px,
                output_height=px,
            )
            print(f"  [OK] {filename} ({px}px)")
        except Exception as e:
            print(f"  [FAIL] {filename}: {e}")

    # Update Contents.json with the new icon filenames
    contents_path = IOS_ASSETS / "Contents.json"
    if contents_path.exists():
        import json
        data = json.loads(contents_path.read_text())
        images = []
        for idiom, scale, px in sizes:
            if idiom == "1024":
                filename = "AppIcon-1024@1x.png"
                images.append({
                    "idiom": "ios-marketing",
                    "size": f"{idiom}x{idiom}",
                    "filename": filename,
                    "scale": "1x",
                })
            else:
                size_str = f"{idiom}x{idiom}"
                images.append({
                    "idiom": "iphone" if int(float(idiom)) <= 60 else "ipad",
                    "size": size_str,
                    "filename": filename,
                    "scale": f"{scale}",
                })
        data["images"] = images
        contents_path.write_text(json.dumps(data, indent=2))
        print("[OK] iOS Contents.json updated")


if __name__ == "__main__":
    print("=== Android Adaptive Icons ===")
    generate_android_adaptive()
    print()
    print("=== iOS Icons ===")
    generate_ios_icons()
    print()
    print("Done.")
