"""Regenerate committed tab PNGs with Pillow (asset tooling only, not a build dependency)."""

from pathlib import Path

from PIL import Image, ImageDraw

OUTPUT = Path(__file__).resolve().parents[1] / "miniprogram/assets/tabs"
SCALE = 16
SIZE = 24 * SCALE


def render(name, selected):
    image = Image.new("RGBA", (SIZE, SIZE))
    draw = ImageDraw.Draw(image)
    color = "#0d5c46" if selected else "#648078"
    width = round((2.2 if selected else 1.8) * SCALE)

    def line(points):
        points = [(round(x * SCALE), round(y * SCALE)) for x, y in points]
        draw.line(points, fill=color, width=width, joint="curve")
        radius = width / 2
        for x, y in points:
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)

    def circle(box):
        draw.ellipse(tuple(round(v * SCALE) for v in box), outline=color, width=width)

    if name == "home":
        line([(3, 10), (12, 3), (21, 10)])
        line([(5, 9), (5, 21), (10, 21), (10, 14), (14, 14), (14, 21), (19, 21), (19, 9)])
    elif name == "sales":
        line([(5, 3), (19, 3), (19, 21), (16.5, 19), (14, 21), (12, 19), (9.5, 21), (7, 19), (5, 21), (5, 3)])
        line([(8, 8), (16, 8)])
        line([(8, 12), (16, 12)])
        line([(8, 16), (12, 16)])
    elif name == "catalog":
        line([(3, 7), (12, 3), (21, 7), (21, 17), (12, 21), (3, 17), (3, 7), (12, 11), (21, 7)])
        line([(12, 11), (12, 21)])
        line([(7.5, 5), (16.5, 9)])
    elif name == "activity":
        circle((3, 3, 21, 21))
        line([(12, 7), (12, 12), (16, 14)])
    elif name == "account":
        circle((8, 3, 16, 11))
        draw.arc((4 * SCALE, 13 * SCALE, 20 * SCALE, 27 * SCALE), 180, 360, fill=color, width=width)
        line([(4, 20), (20, 20)])
    else:
        raise ValueError(name)
    image = image.resize((81, 81), Image.Resampling.LANCZOS)
    image.save(OUTPUT / f"{name}{'-selected' if selected else ''}.png", optimize=True)


OUTPUT.mkdir(parents=True, exist_ok=True)
for icon in ("home", "sales", "catalog", "activity", "account"):
    for active in (False, True):
        render(icon, active)
