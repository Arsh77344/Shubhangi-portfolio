#!/usr/bin/env python3
"""Re-creates the two soft background images used behind the Certifications
and Journal sections from the originals in src/images/originals/.

It lightens the picture (same look as 80% opacity) and fades the bottom edge
into the page colour so there is no hard line. Needs:  pip install pillow numpy
"""
import os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IVORY = np.array([0xFB, 0xF8, 0xF2], float)   # page colour (--ivory)

def bake(src, dst, fade=.24, mix=.20):
    im = np.asarray(Image.open(src).convert('RGB'), float)
    h = im.shape[0]
    im = im * (1 - mix) + IVORY * mix
    start = int(h * (1 - fade))
    for y in range(start, h):
        t = (y - start) / (h - start); t = t * t * (3 - 2 * t)
        im[y] = im[y] * (1 - t) + IVORY * t
    Image.fromarray(im.clip(0, 255).astype('uint8')).save(dst, quality=80, method=6)

o = os.path.join(ROOT, 'src', 'images')
bake(os.path.join(o, 'originals', 'renaissance.webp'), os.path.join(o, 'renaissance_bg.webp'))
bake(os.path.join(o, 'originals', 'columns.webp'), os.path.join(o, 'columns_bg.webp'))
print('done')
