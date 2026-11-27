"""Turn AI-made sprite strips (big fake pixel art on a flat #00FF00 background) into small real pixel-art sheets.

  python tools/build-sprites.py

For each strip in assets/sprites/src it:
  1. keys out the green background,
  2. finds one blob per frame (drops number labels and other small bits under the figures),
  3. scales every frame so hat-top-to-collar is HEAD_H world pixels (keeps the character the same size in every pose),
  4. reduces colours to one shared palette, snaps alpha to on/off,
  5. turns the magenta shirt into 3 exact key shades the game recolours per agent,
  6. writes assets/sprites/<name>.png (frames side by side), <name>@4x.png (same size in the world, 4x the detail,
     for the high-res character layer) + assets/sprites/sprites.json (cell size, anchor, density).
"""
import json, os, sys
import numpy as np, cv2
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sprites')
SRC = os.path.join(ROOT, 'src')
HD = 4                          # density of the high-res sheets (sheet px per world px)
HEAD_H = 8                      # hat top to shirt collar, in world px (drawn sprites: ~10)
KEY = [(255, 0, 255), (192, 0, 192), (128, 0, 128)]   # shirt light / mid / shadow
# character -> {sheet name: (source file in assets/sprites/src/<dir>, frames to keep or None for all)}
# Output sheets are named <prefix><sheet>, e.g. merchant_boat_paddle.png. Each character gets its own palette.
CHARACTERS = {
    '': ('', {                                   # the vendor woman (first test)
        'boat_idle': ('boat_idle.webp', None),
        'boat_paddle': ('boat_paddle.webp', None),   # 2x3 grid
        'foot_idle': ('foot_idle.png', None),
    }),
    'lead_': ('lead', {                          # ป้าแดง, the harbour boss: red blouse, never recoloured
        'desk_idle': ('desk_idle.webp', None),
        'desk_stamp': ('desk_stamp.webp', None),
        'desk_wave': ('desk_wave.webp', None),
        'boat_paddle': ('boat_paddle.png', None),
        'portrait': ('ref.png', None),
    }, 'red', False),
    'merchant_': ('merchant', {                  # the vendor man
        'boat_paddle': ('boat_paddle.webp', None),
        'boat_idle': ('boat_idle.webp', None),     # 2x3 grid
        'foot_idle': ('foot_idle.png', None),
    }),
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
    # reading order: strips are one row, grids several; a new row starts when a frame's top is below
    # the previous row's middle
    hmed = np.median([st[i, 3] for i in big])
    big.sort(key=lambda i: st[i, 1])
    row, rows, top = 0, {}, st[big[0], 1]
    for i in big:
        if st[i, 1] > top + hmed / 2: row, top = row + 1, st[i, 1]
        rows[i] = row
    big.sort(key=lambda i: (rows[i], st[i, 0]))
    out = []
    for i in big:
        x, y, w, h, _ = st[i]
        m = (lab == i)
        # small bits (splashes, loose pixels) whose box overlaps this frame's box, allowing a little below
        # it for splashes under the hull; number labels sit well below and stay out
        for j in range(1, n):
            if j in big: continue
            sx, sy, sw, sh, _ = st[j]
            if sx + sw > x and sx < x + w and sy < y + h + h * .15 and sy + sh > y:
                m |= (lab == j)
        out.append(m)
    # frames that touched each other come out as one extra-wide blob: those can't be split cleanly, so drop them
    wmed = np.median([st[i, 2] for i in big])
    keep = [k for k, i in enumerate(big) if st[i, 2] < 1.4 * wmed]
    if len(keep) < len(out): print(f'  dropped {len(out) - len(keep)} merged blob(s) (frames touching)')
    return [out[k] for k in keep]


# How to find the shirt: it sets the scale (head height), lines frames up, and for agents gets recoloured.
SHIRT = {
    'magenta': lambda r, g, b: (r > 110) & (b > 90) & (g < 0.55 * np.minimum(r, b)) & (r - g > 70),
    'red': lambda r, g, b: (r > 120) & (g < 90) & (b < 90) & (r - g > 60),
}


def head_height(rgb, m, shirt_kind):
    """Hat/hair top to shirt collar: the same in every pose, seated or standing."""
    r, g, b = [rgb[..., k].astype(int) for k in range(3)]
    shirt = m & SHIRT[shirt_kind](r, g, b)
    top = np.nonzero(m.any(1))[0].min()
    rows = shirt.sum(1)
    # first row that is properly shirt (a quarter of its widest row): small bits like a red flower don't count
    collar = np.nonzero(rows > max(3, rows.max() * .25))[0].min()
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


def build(strips, density, colors, meta, shirt_kind='magenta', recolor=True):
    """density 1 = one sheet pixel per world pixel; density 4 = 4x4 sheet pixels per world pixel (high-res layer)."""
    sheets = {}
    for name, (rgb, fr, k) in strips.items():
        sheets[name] = [shrink(rgb, m, k * density) for m in fr]

    # shared palette across every frame of every sheet
    opaque = np.concatenate([s[s[..., 3] > 127][:, :3] for sh in sheets.values() for s in sh])
    # count each distinct colour (in 8-level bins) once, so small bright details (fruit, splash) get palette
    # entries instead of losing every slot to the big brown boat and hat
    opaque = np.unique(opaque // 8, axis=0) * 8 + 4
    pal_img = Image.fromarray(opaque.reshape(1, -1, 3)).quantize(colors=colors, method=Image.Quantize.MEDIANCUT)

    for name, sh in sheets.items():
        # quantize + key the shirt first, then line frames up on the shirt's centre: the seated body is what
        # stays still, while a paddle dipping below the hull would make a bounding-box alignment jump
        done = []
        for s in sh:
            rgb = Image.fromarray(s[..., :3]).quantize(palette=pal_img, dither=Image.Dither.NONE).convert('RGB')
            q = np.array(rgb).astype(int)
            r, g, b = q[..., 0], q[..., 1], q[..., 2]
            a = s[..., 3] > 110
            shirt = a & SHIRT[shirt_kind](r, g, b)
            lum = (r + g + b) / 3
            if recolor and shirt.any():
                t1, t2 = np.percentile(lum[shirt], [66, 25])
                q[shirt & (lum >= t1)] = KEY[0]
                q[shirt & (lum < t1) & (lum >= t2)] = KEY[1]
                q[shirt & (lum < t2)] = KEY[2]
            ys, xs = np.nonzero(shirt) if shirt.any() else np.nonzero(a)
            done.append((np.dstack([q, np.where(a, 255, 0)]).astype(np.uint8), round(xs.mean()), round(ys.mean())))
        CX = max(cx for _, cx, _ in done) + density
        CY = max(cy for _, _, cy in done)
        cw = max(CX - cx + im.shape[1] for im, cx, _ in done) + density
        ch = max(CY - cy + im.shape[0] for im, _, cy in done)
        sheet = np.zeros((ch, cw * len(done), 4), np.uint8)
        for i, (im, cx, cy) in enumerate(done):
            ox, oy = CX - cx, CY - cy
            h, w = im.shape[:2]
            sheet[oy:oy + h, i * cw + ox:i * cw + ox + w] = im
        im0, cx0, cy0 = done[0]
        ax, ay = CX, CY - cy0 + im0.shape[0] - 1        # anchor: under the shirt, at the first frame's bottom
        key = name if density == 1 else f'{name}@{density}x'
        Image.fromarray(sheet, 'RGBA').save(os.path.join(ROOT, key + '.png'))
        meta[key] = {'w': cw, 'h': ch, 'frames': len(done), 'ax': ax, 'ay': ay, 'density': density}
        print(key, len(sh), 'frames', f'{cw}x{ch}')


def main():
    meta = {}
    for prefix, (sub, sheets, *opt) in CHARACTERS.items():
        shirt_kind, recolor = (opt + ['magenta', True][len(opt):]) if opt else ('magenta', True)
        strips = {}
        for name, (f, pick) in sheets.items():
            rgb, mask = load(os.path.join(SRC, sub, f))
            fr = frames(mask)
            if pick: fr = [fr[i] for i in pick]
            strips[prefix + name] = (rgb, fr, HEAD_H / np.median([head_height(rgb, m, shirt_kind) for m in fr]))
        build(strips, 1, 28, meta, shirt_kind, recolor)
        build(strips, HD, 128, meta, shirt_kind, recolor)
    json.dump(meta, open(os.path.join(ROOT, 'sprites.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
