"""
IDEA MINE app icon generator
Draws a pixel-art style diamond on midnight background
using the project's gold accent palette.
"""
from PIL import Image, ImageDraw

SIZE = 1024
GRID = 32
P = SIZE // GRID  # 32px per pixel

# Palette — cyan/blue diamond (matching reference)
COLORS = {
    '_': None,
    'W': (255, 255, 255),    # white highlight
    'L': (200, 240, 255),    # light ice blue
    'G': (120, 210, 255),    # light cyan
    'M': (80, 180, 240),     # mid blue
    'D': (40, 140, 220),     # blue
    'S': (20, 100, 180),     # dark blue
    'B': (10, 60, 130),      # deep blue
}
BG = (16, 18, 24)  # midnight.bg.primary #101218

# 32x32 diamond pattern — faceted gem matching reference image
PATTERN = [
    "________________________________",  # 0
    "________________________________",  # 1
    "________________________________",  # 2
    "________________________________",  # 3
    "________________________________",  # 4
    "_______________WW_______________",  # 5
    "______________LWWL______________",  # 6
    "_____________LLWWLL_____________",  # 7
    "____________GLLWWLLG____________",  # 8
    "___________GGLLWWLLGG___________",  # 9
    "__________DGGLLLLLGGDD__________",  # 10
    "_________DDGGGLLLLGGGDD_________",  # 11
    "________SDDGGGGGGGGGDDDS________",  # 12
    "________BSSDDDDDDDDDDSSB_______",  # 13  girdle
    "_________BSDMGGMMGGMDSB________",  # 14
    "_________BSSDMGGGGMDSSB________",  # 15
    "__________BSSDDGGDDSSB_________",  # 16
    "___________BSSDDDDSSB__________",  # 17
    "____________BSSDDSBB___________",  # 18
    "_____________BSSSSB____________",  # 19
    "______________BSSB_____________",  # 20
    "_______________BB______________",  # 21
    "________________________________",  # 22
    "________________________________",  # 23
    "________________________________",  # 24
    "________________________________",  # 25
    "________________________________",  # 26
    "________________________________",  # 27
    "________________________________",  # 28
    "________________________________",  # 29
    "________________________________",  # 30
    "________________________________",  # 31
]

def draw_glow(img, cx, cy, radius, color, alpha_max=40):
    """Draw a soft radial glow."""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    steps = 30
    for i in range(steps):
        r = radius * (1 - i / steps)
        a = int(alpha_max * (i / steps))
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(*color, a)
        )
    return Image.alpha_composite(img.convert('RGBA'), overlay)

def generate_icon():
    img = Image.new('RGBA', (SIZE, SIZE), (*BG, 255))

    # Add glow behind diamond
    cx, cy = SIZE // 2, int(SIZE * 0.42)
    img = draw_glow(img, cx, cy, 14 * P, (80, 180, 240), alpha_max=35)

    draw = ImageDraw.Draw(img)

    # Draw diamond pixels
    for y, row in enumerate(PATTERN):
        for x, ch in enumerate(row):
            color = COLORS.get(ch)
            if color:
                draw.rectangle(
                    [x * P, y * P, (x + 1) * P - 1, (y + 1) * P - 1],
                    fill=(*color, 255)
                )

    # Sparkle highlights
    sparkles = [
        (10, 7, (255, 255, 255, 200)),
        (9, 8, (200, 240, 255, 120)),
        (22, 10, (255, 255, 255, 150)),
        (23, 11, (200, 240, 255, 80)),
    ]
    for sx, sy, sc in sparkles:
        half = P // 2
        draw.rectangle(
            [sx * P + half//2, sy * P + half//2,
             sx * P + half + half//2, sy * P + half + half//2],
            fill=sc
        )

    return img

def main():
    import os
    assets = os.path.join(os.path.dirname(__file__), '..', 'assets')

    icon = generate_icon()

    # Main icon (1024x1024)
    icon.convert('RGB').save(os.path.join(assets, 'icon.png'))
    print("icon.png saved")

    # Android foreground (1024x1024, diamond only - transparent bg)
    fg = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fg)
    for y, row in enumerate(PATTERN):
        for x, ch in enumerate(row):
            color = COLORS.get(ch)
            if color:
                draw.rectangle(
                    [x * P, y * P, (x + 1) * P - 1, (y + 1) * P - 1],
                    fill=(*color, 255)
                )
    fg.save(os.path.join(assets, 'android-icon-foreground.png'))
    print("android-icon-foreground.png saved")

    # Android background (solid midnight)
    bg = Image.new('RGB', (SIZE, SIZE), BG)
    bg.save(os.path.join(assets, 'android-icon-background.png'))
    print("android-icon-background.png saved")

    # Android monochrome (white diamond on transparent)
    mono = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw_mono = ImageDraw.Draw(mono)
    for y, row in enumerate(PATTERN):
        for x, ch in enumerate(row):
            if COLORS.get(ch):
                draw_mono.rectangle(
                    [x * P, y * P, (x + 1) * P - 1, (y + 1) * P - 1],
                    fill=(255, 255, 255, 255)
                )
    mono.save(os.path.join(assets, 'android-icon-monochrome.png'))
    print("android-icon-monochrome.png saved")

    # Splash icon (same as icon)
    icon.convert('RGB').save(os.path.join(assets, 'splash-icon.png'))
    print("splash-icon.png saved")

    # Favicon (48x48)
    favicon = icon.resize((48, 48), Image.NEAREST)
    favicon.convert('RGB').save(os.path.join(assets, 'favicon.png'))
    print("favicon.png saved")

    print("\nAll icons generated!")

if __name__ == '__main__':
    main()
