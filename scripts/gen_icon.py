#!/usr/bin/env python3
"""Generate PCHelper app icons - PNG multi-size + ICO + logo"""
import math, os
from PIL import Image, ImageDraw, ImageFont

output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
os.makedirs(output_dir, exist_ok=True)

sizes = [16, 24, 32, 48, 64, 96, 128, 256]
bg = (13, 17, 23)
accent = (88, 166, 255)
dim = (48, 54, 61)

base = 512
img = Image.new("RGBA", (base, base), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

m = 30
draw.rounded_rectangle([m, m, base - m, base - m], radius=60, fill=bg)
draw.rounded_rectangle([m, m, base - m, base - m], radius=60, outline=dim, width=3)

cx, cy = base // 2, base // 2 - 10
draw.ellipse([cx - 145, cy - 145, cx + 145, cy + 145], outline=accent, width=4)
draw.ellipse([cx - 130, cy - 130, cx + 130, cy + 130], outline=dim, width=2)

ly = cy
pts = [(cx-100,ly),(cx-70,ly),(cx-55,ly-40),(cx-40,ly+50),(cx-25,ly-20),(cx-10,ly),
       (cx+10,ly),(cx+25,ly-50),(cx+40,ly+60),(cx+55,ly-30),(cx+70,ly),(cx+100,ly)]
for i in range(len(pts)-1):
    draw.line([pts[i], pts[i+1]], fill=accent, width=6)
draw.ellipse([cx+95, ly-6, cx+105, ly+6], fill=accent)

for a in range(180, 360, 20):
    r = math.radians(a)
    dx, dy = 130 * math.cos(r), 130 * math.sin(r)
    c = accent if a % 60 == 0 else dim
    draw.ellipse([cx+int(dx)-4, cy+int(dy)-4, cx+int(dx)+4, cy+int(dy)+4], fill=c)

fnt_l = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 56)
fnt_s = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
draw.text((cx, cy+170), "PCHelper", fill="white", font=fnt_l, anchor="mm")
draw.text((cx, cy+210), "SYSTEM TOOLKIT", fill=(139,148,158), font=fnt_s, anchor="mm")

for sz in sizes:
    img.resize((sz, sz), Image.LANCZOS).save(os.path.join(output_dir, f"icon_{sz}x{sz}.png"), "PNG")

icos = [img.resize((s, s), Image.LANCZOS) for s in sizes]
icos[0].save(os.path.join(output_dir, "icon.ico"), "ICO", sizes=[(s,s) for s in sizes], append_images=icos[1:])
img.save(os.path.join(output_dir, "logo.png"), "PNG")

print(f"✅ Generated: {len(sizes)} PNG sizes, ICO, logo.png")
