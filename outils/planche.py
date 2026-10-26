# Usage: python3 planche.py sortie.jpg colonnes echelle img1 img2 ...
import sys
from PIL import Image
out, cols, sc = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]); fs = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in fs]
w, h = ims[0].size; W, H = int(w * sc), int(h * sc); rows = (len(ims) + cols - 1) // cols
s = Image.new('RGB', (W * cols, H * rows))
for i, im in enumerate(ims): s.paste(im.resize((W, H)), ((i % cols) * W, (i // cols) * H))
s.save(out, quality=88)
