"""
Generate app icons from reference diamond image.
Scales up with NEAREST to preserve pixel art crispness.
"""
from PIL import Image
import os

REF = r"C:\Users\amy\Desktop\diamond-ref.png"
ASSETS = os.path.join(os.path.dirname(__file__), '..', 'assets')
BG = (16, 18, 24)  # midnight.bg.primary

def make_icon(ref_img, size, bg_color=BG):
    """Center the diamond on a bg-colored square, scaled to fit."""
    # Scale ref to ~60% of icon size, nearest neighbor
    scale_target = int(size * 0.85)
    ratio = scale_target / max(ref_img.size)
    new_w = int(ref_img.width * ratio)
    new_h = int(ref_img.height * ratio)
    scaled = ref_img.resize((new_w, new_h), Image.NEAREST)

    # Create background
    icon = Image.new('RGBA', (size, size), (*bg_color, 255))

    # Center paste
    ox = (size - new_w) // 2
    oy = (size - new_h) // 2
    icon.paste(scaled, (ox, oy), scaled if scaled.mode == 'RGBA' else None)
    return icon

def make_foreground(ref_img, size):
    """Diamond on transparent background for Android adaptive."""
    scale_target = int(size * 0.5)  # smaller for adaptive safe zone
    ratio = scale_target / max(ref_img.size)
    new_w = int(ref_img.width * ratio)
    new_h = int(ref_img.height * ratio)
    scaled = ref_img.resize((new_w, new_h), Image.NEAREST)

    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ox = (size - new_w) // 2
    oy = (size - new_h) // 2
    fg.paste(scaled, (ox, oy), scaled if scaled.mode == 'RGBA' else None)
    return fg

def make_monochrome(ref_img, size):
    """White silhouette on transparent for Android monochrome."""
    scale_target = int(size * 0.5)
    ratio = scale_target / max(ref_img.size)
    new_w = int(ref_img.width * ratio)
    new_h = int(ref_img.height * ratio)
    scaled = ref_img.resize((new_w, new_h), Image.NEAREST).convert('RGBA')

    mono = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Make non-transparent pixels white
    pixels = scaled.load()
    for y in range(new_h):
        for x in range(new_w):
            r, g, b, a = pixels[x, y]
            if a > 128:
                pixels[x, y] = (255, 255, 255, 255)
            else:
                pixels[x, y] = (0, 0, 0, 0)

    ox = (size - new_w) // 2
    oy = (size - new_h) // 2
    mono.paste(scaled, (ox, oy), scaled)
    return mono

def main():
    ref = Image.open(REF).convert('RGBA')
    print(f"Reference image: {ref.size}")

    # Main icon
    icon = make_icon(ref, 1024)
    icon.convert('RGB').save(os.path.join(ASSETS, 'icon.png'))
    print("icon.png saved")

    # Android adaptive
    fg = make_foreground(ref, 1024)
    fg.save(os.path.join(ASSETS, 'android-icon-foreground.png'))
    print("android-icon-foreground.png saved")

    bg = Image.new('RGB', (1024, 1024), BG)
    bg.save(os.path.join(ASSETS, 'android-icon-background.png'))
    print("android-icon-background.png saved")

    mono = make_monochrome(ref, 1024)
    mono.save(os.path.join(ASSETS, 'android-icon-monochrome.png'))
    print("android-icon-monochrome.png saved")

    # Splash
    icon.convert('RGB').save(os.path.join(ASSETS, 'splash-icon.png'))
    print("splash-icon.png saved")

    # Favicon
    favicon = make_icon(ref, 48)
    favicon.convert('RGB').save(os.path.join(ASSETS, 'favicon.png'))
    print("favicon.png saved")

    print("\nAll icons generated from reference!")

if __name__ == '__main__':
    main()
