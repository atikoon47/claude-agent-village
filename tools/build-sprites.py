"""Turn AI-made sprite strips (big fake pixel art on a flat #00FF00 background) into small real pixel-art sheets.

  python tools/build-sprites.py

For each strip in assets/sprites/src it:
  1. keys out the green background,
  2. finds one blob per frame (drops number labels and other small bits under the figures),
  3. scales every frame so hat-top-to-collar is HEAD_H world pixels (keeps the character the same size in every pose),
  4. reduces colours to one shared palette, snaps alpha to on/off,
  5. turns the magenta shirt into 3 exact key shades the game recolours per agent,
  6. writes assets/sprites/<name>.png (frames side by side) + assets/sprites/sprites.json (cell size, anchor).
"""
import json, os, sys
import numpy as np, cv2
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sprites')
SRC = os.path.join(ROOT, 'src')
HEAD_H = 8                      # hat top to shirt collar, in world px (drawn sprites: ~10)
KEY = [(255, 0, 255), (192, 0, 192), (128, 0, 128)]   # shirt light / mid / shadow
STRIPS = {                      # name -> source file
    'boat_idle': 'boat_idle.webp',
    'foot_idle': 'foot_idle.png',
}


def load(path):
    a = np.array(Image.open(path).convert('RGB')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g > 140) & (g - np.maximum(r, b) > 60)
    # pull green fringes off the edge pixels
    a[..., 1] = np.where(~green & (g > np.maximum(r, b) + 20), np.maximum(r, b) + 20, g)
    return a.astype(np.uint8), (~green).astype(np.uint8)


def frames(mask):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
    big = [i for i in range(1, n) if st[i, 4] > 3000]
    bottom = max(st[i, 1] + st[i, 3] for i in big)
    out = []
    for i in sorted(big, key=lambda i: st[i, 0]):
        x, y, w, h, _ = st[i]
        m = (lab == i)
        # small bits (splashes, loose pixels) that sit inside this frame's box and above the label row
        for j in range(1, n):
            if j in big: continue
            sx, sy, sw, sh, _ = st[j]
            if sy < bottom and sx + sw > x and sx < x + w:
                m |= (lab == j)
        out.append(m)
    return out


def head_height(rgb, m):
    """Hat top to shirt collar: the same in every pose, seated or standing (the magenta shirt is easy to find)."""
    r, g, b = [rgb[..., k].astype(int) for k in range(3)]
    shirt = m & (r > 150) & (b > 120) & (g < 110)
    top = np.nonzero(m.any(1))[0].min()
    collar = np.nonzero(shirt.sum(1) > 3)[0].min()
    return collar - top


def shrink(rgb, m, k):
    ys, xs = np.nonzero(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.dstack([rgb[y0:y1, x0:x1], (m[y0:y1, x0:x1] * 255).astype(np.uint8)])
    W, H = max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))
    im = Image.fromarray(rgba, 'RGBA')
    # premultiplied area average so the background never bleeds into edge colours
    pre = np.array(im).astype(np.float32); pre[..., :3] *= pre[..., 3:] / 255
    small = cv2.resize(pre, (W, H), interpolation=cv2.INTER_AREA)
    al = small[..., 3:]
    col = np.where(al > 0, small[..., :3] * 255 / np.maximum(al, 1), 0)
    return np.dstack([col, al]).clip(0, 255).astype(np.uint8)


def main():
    meta, sheets = {}, {}
    for name, f in STRIPS.items():
        rgb, mask = load(os.path.join(SRC, f))
        fr = frames(mask)
        k = HEAD_H / np.median([head_height(rgb, m) for m in fr])
        sheets[name] = [shrink(rgb, m, k) for m in fr]

    # shared palette across every frame of every sheet
    opaque = np.concatenate([s[s[..., 3] > 127][:, :3] for sh in sheets.values() for s in sh])
    pal_img = Image.fromarray(opaque.reshape(1, -1, 3)).quantize(colors=28, method=Image.Quantize.MEDIANCUT)

    for name, sh in sheets.items():
        cw = max(s.shape[1] for s in sh) + 2
        ch = max(s.shape[0] for s in sh) + 1
        sheet = np.zeros((ch, cw * len(sh), 4), np.uint8)
        for i, s in enumerate(sh):
            rgb = Image.fromarray(s[..., :3]).quantize(palette=pal_img, dither=Image.Dither.NONE).convert('RGB')
            q = np.array(rgb).astype(int)
            r, g, b = q[..., 0], q[..., 1], q[..., 2]
            shirt = (r > 110) & (b > 90) & (g < 0.55 * np.minimum(r, b)) & (r - g > 70)
            lum = (r + g + b) / 3
            if shirt.any():
                t1, t2 = np.percentile(lum[shirt], [66, 25])
                q[shirt & (lum >= t1)] = KEY[0]
                q[shirt & (lum < t1) & (lum >= t2)] = KEY[1]
                q[shirt & (lum < t2)] = KEY[2]
            a = np.where(s[..., 3] > 110, 255, 0)
            h, w = s.shape[:2]
            ox = (cw - w) // 2; oy = ch - h          # bottom-centre aligned in its cell
            sheet[oy:oy + h, i * cw + ox:i * cw + ox + w] = np.dstack([q, a]).astype(np.uint8)
        Image.fromarray(sheet, 'RGBA').save(os.path.join(ROOT, name + '.png'))
        meta[name] = {'w': cw, 'h': ch, 'frames': len(sh), 'ax': cw // 2, 'ay': ch - 1}
        print(name, len(sh), 'frames', f'{cw}x{ch}')
    json.dump(meta, open(os.path.join(ROOT, 'sprites.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
