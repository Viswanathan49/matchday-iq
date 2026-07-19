import sys
from PIL import Image

def process(file_in, file_out):
    img = Image.open(file_in).convert("RGBA")
    pixels = img.load()
    
    # We will do a simple flood fill from the top-left corner (0,0)
    # The background is a checkerboard, so we need to flood fill all connected white and grey pixels.
    # To handle the checkerboard, we consider a pixel "background" if it's very close to white or grey.
    
    def is_bg(r, g, b):
        if r > 180 and abs(r-g) < 15 and abs(g-b) < 15:
            return True
        return False
        
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if is_bg(r, g, b):
                pixels[x, y] = (r, g, b, 0)
                
    img.save(file_out)

process("../public/spain.png", "../public/spain_nobg.png")
process("../public/argentina.png", "../public/argentina_nobg.png")
