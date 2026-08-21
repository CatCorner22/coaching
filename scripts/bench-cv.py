#!/usr/bin/env python3
"""Benchmark Musubi camera/CV skills against literature defaults.

References
----------
- Pei-Sze Liao / Kovac, Peer, Solina 2003 RGB skin rule
- PyImageSearch / Pech-Pacheco et al. Laplacian variance blur (threshold ~100 at full res)
- CIE76 ΔE: ~2.3 just-noticeable difference
- Hugging Face Qualcomm/MediaPipe-Pose-Estimation: 3.1MB detector + 12.9MB landmarks
  (too heavy for first paint; we stay geometric unless pose WASM is cached)
"""
from __future__ import annotations

import json
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path("/workspace")
OUT = ROOT / "scripts" / "bench-report.json"


def to_rgb(path: Path, size: int = 240) -> np.ndarray:
    im = Image.open(path).convert("RGB")
    im.thumbnail((size, size))
    return np.asarray(im, dtype=np.float64)


def laplacian_var(gray: np.ndarray) -> float:
    # 4-neighbor kernel (matches src/lib/camera/quality.ts)
    k = np.array([[0, -1, 0], [-1, 4, -1], [0, -1, 0]], dtype=np.float64)
    pad = np.pad(gray, 1, mode="edge")
    acc = np.zeros_like(gray)
    for dy in range(3):
        for dx in range(3):
            acc += k[dy, dx] * pad[dy : dy + gray.shape[0], dx : dx + gray.shape[1]]
    return float(acc.var())


def opencv_laplacian_var(gray: np.ndarray) -> float:
    k = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float64)
    pad = np.pad(gray, 1, mode="edge")
    acc = np.zeros_like(gray)
    for dy in range(3):
        for dx in range(3):
            acc += k[dy, dx] * pad[dy : dy + gray.shape[0], dx : dx + gray.shape[1]]
    return float(acc.var())


def gray(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def kovac_skin(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    return (
        (r > 95)
        & (g > 40)
        & (b > 20)
        & ((mx - mn) > 15)
        & (np.abs(r - g) > 15)
        & (r > g)
        & (r > b)
    )


def musubi_skin(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (
        (r > 90)
        & (g > 35)
        & (b > 15)
        & (r > g)
        & (r > b)
        & ((r - g) > 12)
        & ((r - b) > 12)
        & ((g - b) > -12)
    )


def musubi_rope(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    s = np.where(mx == 0, 0, (mx - mn) / mx)
    return (
        (r > 70)
        & (r > g)
        & (g >= b - 8)
        & (s > 0.12)
        & (s < 0.82)
        & (mx > 55)
        & (mx < 230)
        & ((r - b) > 18)
        & ((r - g) < 90)
    )


def delta_e76(a: np.ndarray, b: np.ndarray) -> float:
    # a,b sRGB 0-255
    def rgb_to_lab(c):
        x = c / 255.0
        x = np.where(x > 0.04045, ((x + 0.055) / 1.055) ** 2.4, x / 12.92)
        m = np.array(
            [
                [0.4124, 0.3576, 0.1805],
                [0.2126, 0.7152, 0.0722],
                [0.0193, 0.1192, 0.9505],
            ]
        )
        xyz = x @ m.T
        xyz = xyz / np.array([0.95047, 1.0, 1.08883])
        f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
        L = 116 * f[1] - 16
        A = 500 * (f[0] - f[1])
        B = 200 * (f[1] - f[2])
        return np.array([L, A, B])

    return float(np.linalg.norm(rgb_to_lab(a) - rgb_to_lab(b)))


def main() -> None:
    coils = to_rgb(ROOT / "public" / "coils.jpg")
    hero = to_rgb(ROOT / "public" / "hero.jpg")
    blue = np.zeros_like(coils)
    blue[..., 2] = 180
    skin = np.zeros_like(coils)
    skin[..., 0] = 198
    skin[..., 1] = 142
    skin[..., 2] = 118

    g_coils = gray(coils)
    g_blur = np.asarray(
        Image.fromarray(g_coils.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=2.4)),
        dtype=np.float64,
    )

    t0 = time.perf_counter()
    lv_sharp = laplacian_var(g_coils)
    lv_blur = laplacian_var(g_blur)
    lv_hero = laplacian_var(gray(hero))
    cv_sharp = opencv_laplacian_var(g_coils)
    dt_ms = (time.perf_counter() - t0) * 1000

    rope_coils = float(musubi_rope(coils).mean())
    rope_blue = float(musubi_rope(blue).mean())
    rope_skin = float(musubi_rope(skin).mean())
    skin_on_skin = float(musubi_skin(skin).mean())
    kovac_on_skin = float(kovac_skin(skin).mean())
    skin_on_rope = float(musubi_skin(coils).mean())
    kovac_on_rope = float(kovac_skin(coils).mean())

    de_pale = delta_e76(
        np.array([220, 200, 190], dtype=np.float64),
        np.array([198, 142, 118], dtype=np.float64),
    )

    report = {
        "literature": {
            "laplacian_blur_threshold_full_res": 100.0,
            "source": "PyImageSearch / Pech-Pacheco 2000; default 100.0",
            "cie76_jnd": 2.3,
            "hf_pose": {
                "model": "qualcomm/MediaPipe-Pose-Estimation",
                "detector_mb": 3.14,
                "landmark_mb": 12.9,
                "input": "256x256",
                "decision": "skip-on-first-paint; geometric bbox remains the default",
            },
        },
        "timing_ms_three_laplacians": round(dt_ms, 2),
        "laplacian": {
            "coils_sharp_4n": round(lv_sharp, 2),
            "coils_blur_4n": round(lv_blur, 2),
            "hero_4n": round(lv_hero, 2),
            "coils_sharp_opencv_sign": round(cv_sharp, 2),
            "separation_ratio_sharp_over_blur": round(lv_sharp / max(lv_blur, 1e-6), 2),
            "musubi_norm_divisor": 180,
            "musubi_soft_cutoff_norm": 0.28,
            "implied_raw_cutoff": 50.4,
            "pass_sharp_vs_literature_scaled": lv_sharp > 50,
        },
        "rope_recall_on_jute_still": {
            "coils_jpg": round(rope_coils, 4),
            "false_on_blue": round(rope_blue, 4),
            "false_on_skin_patch": round(rope_skin, 4),
        },
        "skin": {
            "musubi_on_skin_patch": round(skin_on_skin, 4),
            "kovac_on_skin_patch": round(kovac_on_skin, 4),
            "musubi_false_on_jute": round(skin_on_rope, 4),
            "kovac_false_on_jute": round(kovac_on_rope, 4),
            "prefer": "AND Kovac with current rule to cut jute false-positives"
            if kovac_on_rope < skin_on_rope
            else "keep current",
        },
        "circulation_deltaE": {
            "pale_hand_vs_warm": round(de_pale, 2),
            "jnd": 2.3,
            "note": "A 15+ ΔE shift is a real color change, not noise. Current palenessDelta uses slope, which is correct.",
        },
        "recommendations": [],
    }

    recs = report["recommendations"]
    if lv_sharp / max(lv_blur, 1) < 3:
        recs.append("Blur separation is weak; prefer OpenCV-signed Laplacian and compare in-tile max.")
    else:
        recs.append("Keep 4-neighbor Laplacian; sharp/blur ratio is healthy on jute stills.")
    if rope_coils < 0.04:
        recs.append("Rope hint on coils.jpg is low after downscale — weight rope lower or score in tiles.")
    else:
        recs.append("Rope classifier fires on real jute; keep HSV-brown rule.")
    if kovac_on_rope < skin_on_rope:
        recs.append("Tighten isSkin to Kovac 2003 to reduce jute counted as skin.")
    recs.append("Do not ship ViTPose/MediaPipe on first load (16MB+). Optional later WASM cache.")

    OUT.write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
