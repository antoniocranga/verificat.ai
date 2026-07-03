"""Create Android adaptive icon XML files (no cairo dependency)."""

import os
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
RES = BASE / "android" / "app" / "src" / "main" / "res"

# Colors
(RES / "values").mkdir(parents=True, exist_ok=True)
(RES / "values" / "colors.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#D97757</color>
</resources>
""", encoding="utf-8")

# Foreground vector drawable
(RES / "drawable").mkdir(parents=True, exist_ok=True)
(RES / "drawable" / "ic_launcher_foreground.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
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
""", encoding="utf-8")

# Adaptive icon XML
(RES / "mipmap-anydpi-v26").mkdir(parents=True, exist_ok=True)
(RES / "mipmap-anydpi-v26" / "ic_launcher.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
""", encoding="utf-8")

(RES / "mipmap-anydpi-v26" / "ic_launcher_round.xml").write_text("""<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
""", encoding="utf-8")

print("Android adaptive icons created:")
for f in sorted(RES.rglob("ic_launcher*")):
    print(f"  {f.relative_to(RES)}")
