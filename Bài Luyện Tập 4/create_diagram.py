import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"c:\Users\VTS\OneDrive\Desktop\BT_Mobile\Bài Luyện Tập 4\Ảnh"
os.makedirs(OUTPUT_DIR, exist_ok=True)
output_path = os.path.join(OUTPUT_DIR, "so_do_react_native.png")

# Setup Canvas
width = 1100
height = 680
img = Image.new("RGB", (width, height), color=(15, 23, 42)) # Slate 900
draw = ImageDraw.Draw(img)

# Setup Fonts
font_path = "C:/Windows/Fonts/consola.ttf"
title_font = ImageFont.truetype(font_path, 26)
header_font = ImageFont.truetype(font_path, 19)
body_font = ImageFont.truetype(font_path, 15)
small_font = ImageFont.truetype(font_path, 13)

# Header Bar
draw.rectangle([(0, 0), (width, 70)], fill=(30, 41, 59))
draw.text((35, 22), "REACT NATIVE ARCHITECTURE - QUY TRINH HOAT DONG CO BAN", font=title_font, fill=(56, 189, 248))

# Draw 3 Columns
# Col 1: JS World
# Col 2: The Bridge
# Col 3: Native World

# 1. JS World Box
col1_x1, col1_y1, col1_x2, col1_y2 = 40, 100, 360, 620
draw.rounded_rectangle([(col1_x1, col1_y1), (col1_x2, col1_y2)], radius=12, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
draw.text((col1_x1 + 20, col1_y1 + 18), "1. JAVASCRIPT WORLD", font=header_font, fill=(56, 189, 248))
draw.text((col1_x1 + 20, col1_y1 + 45), "(Chay tren JS Thread)", font=small_font, fill=(148, 163, 184))

# Sub cards in Col 1
draw.rounded_rectangle([(col1_x1 + 15, col1_y1 + 80), (col1_x2 - 15, col1_y1 + 220)], radius=8, fill=(15, 23, 42), outline=(100, 116, 139))
draw.text((col1_x1 + 25, col1_y1 + 95), "MA NGUON JAVASCRIPT", font=body_font, fill=(250, 204, 21))
draw.text((col1_x1 + 25, col1_y1 + 125), "- React Components\n- Cu phap JSX (<View>, <Text>)\n- Quan ly State, Props, Hooks\n- Logic xu ly nghiep vu", font=small_font, fill=(226, 232, 240))

draw.text((col1_x1 + 140, col1_y1 + 235), "|", font=header_font, fill=(56, 189, 248))
draw.text((col1_x1 + 140, col1_y1 + 255), "v", font=header_font, fill=(56, 189, 248))

draw.rounded_rectangle([(col1_x1 + 15, col1_y1 + 285), (col1_x2 - 15, col1_y1 + 480)], radius=8, fill=(15, 23, 42), outline=(100, 116, 139))
draw.text((col1_x1 + 25, col1_y1 + 300), "JS RUNTIME / ENGINE", font=body_font, fill=(250, 204, 21))
draw.text((col1_x1 + 25, col1_y1 + 325), "(Hermes hoac JSCore)", font=small_font, fill=(148, 163, 184))
draw.text((col1_x1 + 25, col1_y1 + 355), "- Bien dich va chay ma JS\n- Tinh toan Virtual DOM\n- Dong goi chi thi UI thanh\n  cac chuoi JSON bat dong bo\n- Nhan su kien va goi callback", font=small_font, fill=(226, 232, 240))

# 2. Bridge Box
col2_x1, col2_y1, col2_x2, col2_y2 = 410, 150, 690, 570
draw.rounded_rectangle([(col2_x1, col2_y1), (col2_x2, col2_y2)], radius=12, fill=(49, 46, 129), outline=(129, 140, 248), width=2)
draw.text((col2_x1 + 35, col2_y1 + 25), "2. THE BRIDGE", font=header_font, fill=(199, 210, 254))
draw.text((col2_x1 + 25, col2_y1 + 55), "(Cau noi trung gian 2 chieu)", font=small_font, fill=(165, 180, 252))

draw.rounded_rectangle([(col2_x1 + 15, col2_y1 + 95), (col2_x2 - 15, col2_y1 + 380)], radius=8, fill=(30, 27, 75), outline=(99, 102, 241))
draw.text((col2_x1 + 25, col2_y1 + 115), "DAC DIEM COT LOI:", font=body_font, fill=(250, 204, 21))
draw.text((col2_x1 + 25, col2_y1 + 150), "1. Bat dong bo (Async):\n   Khong lam chan (block) UI\n\n2. Tuan tu hoa (Serialized):\n   Moi lenh duoc dong goi\n   thanh chuoi JSON\n\n3. Theo dot (Batched):\n   Gom nhieu lenh gui cung luc\n   de toi uu hieu nang", font=small_font, fill=(224, 231, 255))

# Connecting Arrows from Col 1 to Col 2
draw.text((370, 370), "-->", font=header_font, fill=(250, 204, 21))
draw.text((370, 395), "JSON", font=small_font, fill=(250, 204, 21))

draw.text((370, 440), "<--", font=header_font, fill=(56, 189, 248))
draw.text((370, 465), "Event", font=small_font, fill=(56, 189, 248))

# 3. Native World Box
col3_x1, col3_y1, col3_x2, col3_y2 = 740, 100, 1060, 620
draw.rounded_rectangle([(col3_x1, col3_y1), (col3_x2, col3_y2)], radius=12, fill=(6, 78, 59), outline=(52, 211, 153), width=2)
draw.text((col3_x1 + 30, col3_y1 + 18), "3. NATIVE WORLD", font=header_font, fill=(110, 231, 183))
draw.text((col3_x1 + 30, col3_y1 + 45), "(Android: Java/Kotlin | iOS: Swift)", font=small_font, fill=(167, 243, 208))

# Sub cards in Col 3
draw.rounded_rectangle([(col3_x1 + 15, col3_y1 + 80), (col3_x2 - 15, col3_y1 + 260)], radius=8, fill=(2, 44, 34), outline=(16, 185, 129))
draw.text((col3_x1 + 25, col3_y1 + 95), "NATIVE VIEWS (UI THREAD)", font=body_font, fill=(250, 204, 21))
draw.text((col3_x1 + 25, col3_y1 + 125), "- Anh xa truc tiep thanh\n  Widget goc cua he dieu hanh\n- Android: ViewGroup, TextView\n- iOS: UIView, UILabel\n- Trai nghiem 60-120 FPS\n- Bat su kien Touch nguoi dung", font=small_font, fill=(209, 250, 229))

draw.rounded_rectangle([(col3_x1 + 15, col3_y1 + 290), (col3_x2 - 15, col3_y1 + 480)], radius=8, fill=(2, 44, 34), outline=(16, 185, 129))
draw.text((col3_x1 + 25, col3_y1 + 305), "NATIVE MODULES", font=body_font, fill=(250, 204, 21))
draw.text((col3_x1 + 25, col3_y1 + 335), "- Truc tiep goi API phan cung\n- Camera, Thu vien anh\n- Dinh vi GPS toa do\n- Cam bien, SQLite, Bluetooth\n- Gui du lieu phan hoi ve JS", font=small_font, fill=(209, 250, 229))

# Connecting Arrows from Col 2 to Col 3
draw.text((700, 300), "-->", font=header_font, fill=(52, 211, 153))
draw.text((700, 325), "Draw", font=small_font, fill=(52, 211, 153))

draw.text((700, 420), "<--", font=header_font, fill=(250, 204, 21))
draw.text((700, 445), "Data", font=small_font, fill=(250, 204, 21))

# Footer
draw.text((width // 2 - 230, 640), "[ REACT NATIVE WORKFLOW - BTL1 TO BTL4 ]", font=small_font, fill=(148, 163, 184))

img.save(output_path, "PNG")
print("Diagram generated successfully.")
