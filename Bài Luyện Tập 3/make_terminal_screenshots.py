import subprocess
import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"c:\Users\VTS\OneDrive\Desktop\BT_Mobile\Bài Luyện Tập 3\Ảnh"
CWD = r"c:\Users\VTS\OneDrive\Desktop\BT_Mobile\Bài Luyện Tập 3"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_terminal_image(title, command, output_text, output_filepath):
    # Setup fonts
    font_path = "C:/Windows/Fonts/consola.ttf"
    font_size = 18
    font = ImageFont.truetype(font_path, font_size)
    title_font = ImageFont.truetype(font_path, 15)
    
    # Calculate line height and dimensions
    lines = [f"PS C:\\Users\\VTS\\...\\Bài Luyện Tập 3> {command}"]
    lines.extend(output_text.splitlines())
    
    line_height = 26
    padding_x = 35
    padding_top = 60 # Title bar space
    padding_bottom = 35
    
    # Find max width
    max_line_len = 0
    for l in lines:
        try:
            bbox = font.getbbox(l)
            w = bbox[2] - bbox[0]
            if w > max_line_len:
                max_line_len = w
        except:
            pass
            
    img_width = max(max_line_len + padding_x * 2, 850)
    img_height = padding_top + len(lines) * line_height + padding_bottom
    
    # Base background (sleek dark mode)
    bg_color = (24, 24, 27) # #18181b (Dark slate)
    window_header_color = (39, 39, 42) # #27272a
    
    img = Image.new("RGB", (img_width, img_height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw Title Bar
    draw.rectangle([(0, 0), (img_width, 45)], fill=window_header_color)
    
    # Traffic light window buttons
    button_y = 22
    radius = 6
    # Red
    draw.ellipse([(20 - radius, button_y - radius), (20 + radius, button_y + radius)], fill=(239, 68, 68))
    # Yellow
    draw.ellipse([(40 - radius, button_y - radius), (40 + radius, button_y + radius)], fill=(245, 158, 11))
    # Green
    draw.ellipse([(60 - radius, button_y - radius), (60 + radius, button_y + radius)], fill=(16, 185, 129))
    
    # Title Bar Text
    draw.text((img_width // 2 - 120, 14), title, font=title_font, fill=(161, 161, 170))
    
    # Render lines
    y = padding_top
    for i, line in enumerate(lines):
        if i == 0:
            # Prompt line
            draw.text((padding_x, y), "PS C:\\...\\Bài Luyện Tập 3> ", font=font, fill=(56, 189, 248)) # Light blue
            prompt_w = font.getbbox("PS C:\\...\\Bài Luyện Tập 3> ")[2]
            draw.text((padding_x + prompt_w, y), command, font=font, fill=(250, 204, 21)) # Yellow cmd
        else:
            # Output line
            color = (228, 228, 231) # Light gray
            if "BÀI TẬP" in line or "===" in line or "---" in line:
                color = (129, 140, 248) # Indigo highlight
            elif "THÀNH CÔNG" in line or "Còn hàng" in line:
                color = (74, 222, 128) # Green
            elif "Hết hàng" in line or "false" in line:
                color = (248, 113, 113) # Red / Coral
            elif "📌" in line or "👉" in line or "Kiểm tra" in line:
                color = (251, 191, 36) # Amber
            elif "┌" in line or "├" in line or "└" in line or "│" in line:
                color = (148, 163, 184) # Slate borders
                
            draw.text((padding_x, y), line, font=font, fill=color)
        y += line_height
        
    img.save(output_filepath, "PNG")
    print(f"Created image: {os.path.basename(output_filepath)}")

# Chạy và chụp Bài 1
res1 = subprocess.run(["node", "basic.js"], cwd=CWD, capture_output=True, text=True, encoding="utf-8")
create_terminal_image(
    "Terminal - Node.js: basic.js (Bài 1)",
    "node basic.js",
    res1.stdout,
    os.path.join(OUTPUT_DIR, "console_bai1.png")
)

# Chạy và chụp Bài 2
res2 = subprocess.run(["node", "app.js"], cwd=CWD, capture_output=True, text=True, encoding="utf-8")
create_terminal_image(
    "Terminal - Node.js: app.js (Bài 2)",
    "node app.js",
    res2.stdout,
    os.path.join(OUTPUT_DIR, "console_bai2.png")
)

# Chạy và chụp Bài 3
res3 = subprocess.run(["node", "products.js"], cwd=CWD, capture_output=True, text=True, encoding="utf-8")
create_terminal_image(
    "Terminal - Node.js: products.js (Bài 3)",
    "node products.js",
    res3.stdout,
    os.path.join(OUTPUT_DIR, "console_bai3.png")
)

# Chạy và chụp Tổng hợp
res_all = subprocess.run(["node", "run_all.js"], cwd=CWD, capture_output=True, text=True, encoding="utf-8")
create_terminal_image(
    "Terminal - Node.js: run_all.js (Tổng hợp 3 bài)",
    "node run_all.js",
    res_all.stdout,
    os.path.join(OUTPUT_DIR, "console_tong_hop.png")
)
