import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"c:\Users\VTS\OneDrive\Desktop\BT_Mobile\Bài Luyện Tập 5\Ảnh"
os.makedirs(OUTPUT_DIR, exist_ok=True)
font_path = "C:/Windows/Fonts/consola.ttf"

# ==============================================================================
# 1. TẠO ẢNH: SO DO 3 LUONG (so_do_3_luong.png)
# ==============================================================================
w1, h1 = 1100, 620
img1 = Image.new("RGB", (w1, h1), color=(15, 23, 42)) # Slate 900
draw1 = ImageDraw.Draw(img1)

title_font = ImageFont.truetype(font_path, 24)
header_font = ImageFont.truetype(font_path, 18)
body_font = ImageFont.truetype(font_path, 15)
small_font = ImageFont.truetype(font_path, 13)

# Header
draw1.rectangle([(0, 0), (w1, 70)], fill=(30, 41, 59))
draw1.text((35, 22), "REACT NATIVE - SO DO PHOI HOP 3 LUONG CHINH (3 THREADS)", font=title_font, fill=(56, 189, 248))

# 3 Columns
# Col 1: JS Thread
c1_x1, c1_y1, c1_x2, c1_y2 = 40, 110, 360, 560
draw1.rounded_rectangle([(c1_x1, c1_y1), (c1_x2, c1_y2)], radius=12, fill=(30, 41, 59), outline=(56, 189, 248), width=2)
draw1.text((c1_x1 + 20, c1_y1 + 20), "1. JAVASCRIPT THREAD", font=header_font, fill=(56, 189, 248))
draw1.text((c1_x1 + 20, c1_y1 + 50), "(Chay Hermes / JSCore)", font=small_font, fill=(148, 163, 184))

draw1.rounded_rectangle([(c1_x1 + 15, c1_y1 + 90), (c1_x2 - 15, c1_y2 - 20)], radius=8, fill=(15, 23, 42), outline=(100, 116, 139))
draw1.text((c1_x1 + 25, c1_y1 + 110), "NHIEM VU CHINH:", font=body_font, fill=(250, 204, 21))
draw1.text((c1_x1 + 25, c1_y1 + 145), 
"- Doc va thuc thi ma JS\n"
"- Quan ly State, Props, Hooks\n"
"- Xu ly logic nghiep vu & API\n"
"- Tao React Element Tree\n"
"  (Virtual DOM)\n"
"- Gui chi thi the <View>, <Text>\n"
"  va styles Flexbox sang\n"
"  Shadow Thread\n"
"- Nhan su kien Touch tu Native\n"
"  va kich hoat callback onPress", font=small_font, fill=(226, 232, 240))

# Col 2: Shadow Thread
c2_x1, c2_y1, c2_x2, c2_y2 = 390, 110, 710, 560
draw1.rounded_rectangle([(c2_x1, c2_y1), (c2_x2, c2_y2)], radius=12, fill=(49, 46, 129), outline=(129, 140, 248), width=2)
draw1.text((c2_x1 + 20, c2_y1 + 20), "2. SHADOW THREAD", font=header_font, fill=(199, 210, 254))
draw1.text((c2_x1 + 20, c2_y1 + 50), "(Yoga Layout Engine C++)", font=small_font, fill=(165, 180, 252))

draw1.rounded_rectangle([(c2_x1 + 15, c2_y1 + 90), (c2_x2 - 15, c2_y2 - 20)], radius=8, fill=(30, 27, 75), outline=(99, 102, 241))
draw1.text((c2_x1 + 25, c2_y1 + 110), "KIEN TRUC SU DO DAC:", font=body_font, fill=(250, 204, 21))
draw1.text((c2_x1 + 25, c2_y1 + 145), 
"- Nhan thuoc tinh Flexbox:\n"
"  flexDirection, justifyContent,\n"
"  alignItems, padding, margin\n\n"
"- Tinh toan hinh hoc cuc nhanh:\n"
"  + Toa do x, y tuyet doi\n"
"  + Chieu rong (width) pixel\n"
"  + Chieu cao (height) pixel\n\n"
"- Dong goi cay bo cuc hoan\n"
"  chinh ban giao cho Native Thread\n"
"- Khong lam ton tai nguyen UI", font=small_font, fill=(224, 231, 255))

# Col 3: Native / UI Thread
c3_x1, c3_y1, c3_x2, c3_y2 = 740, 110, 1060, 560
draw1.rounded_rectangle([(c3_x1, c3_y1), (c3_x2, c3_y2)], radius=12, fill=(6, 78, 59), outline=(52, 211, 153), width=2)
draw1.text((c3_x1 + 20, c3_y1 + 20), "3. NATIVE / UI THREAD", font=header_font, fill=(110, 231, 183))
draw1.text((c3_x1 + 20, c3_y1 + 50), "(Main Thread He Dieu Hanh)", font=small_font, fill=(167, 243, 208))

draw1.rounded_rectangle([(c3_x1 + 15, c3_y1 + 90), (c3_x2 - 15, c3_y2 - 20)], radius=8, fill=(2, 44, 34), outline=(16, 185, 129))
draw1.text((c3_x1 + 25, c3_y1 + 110), "THO XAY DUNG (RENDER):", font=body_font, fill=(250, 204, 21))
draw1.text((c3_x1 + 25, c3_y1 + 145), 
"- Tiep nhan toa do tu Shadow Thread\n\n"
"- Tao cac Widget goc (Native Views):\n"
"  + Android: ViewGroup, TextView\n"
"  + iOS: UIView, UILabel\n\n"
"- Ve truc tiep pixel len man hinh\n"
"- Duy tri khung hinh 60 - 120 FPS\n\n"
"- Lang nghe cu chi Touch cua user\n"
"  gui nguoc ve cho JS Thread", font=small_font, fill=(209, 250, 229))

# Connecting Arrows
draw1.text((364, 310), "-->", font=header_font, fill=(250, 204, 21))
draw1.text((362, 335), "Flex", font=small_font, fill=(250, 204, 21))

draw1.text((714, 310), "-->", font=header_font, fill=(52, 211, 153))
draw1.text((712, 335), "Pixel", font=small_font, fill=(52, 211, 153))

# Return Event Arrow
draw1.text((530, 580), "<==================== Touch Event / Data ====================", font=small_font, fill=(56, 189, 248))

path1 = os.path.join(OUTPUT_DIR, "so_do_3_luong.png")
img1.save(path1, "PNG")

# ==============================================================================
# 2. TẠO ẢNH: HELLO REACT NATIVE MOCKUP (hello_react_native.png)
# ==============================================================================
w2, h2 = 500, 780
img2 = Image.new("RGB", (w2, h2), color=(15, 23, 42)) # Slate 900
draw2 = ImageDraw.Draw(img2)

# Smartphone frame
phone_x1, phone_y1, phone_x2, phone_y2 = 50, 30, 450, 750
draw2.rounded_rectangle([(phone_x1, phone_y1), (phone_x2, phone_y2)], radius=36, fill=(2, 6, 23), outline=(71, 85, 105), width=4)

# Camera notch / Dynamic island
draw2.rounded_rectangle([(phone_x1 + 130, phone_y1 + 15), (phone_x2 - 130, phone_y1 + 40)], radius=12, fill=(0, 0, 0))

# Status bar icons
draw2.text((phone_x1 + 30, phone_y1 + 20), "9:41", font=small_font, fill=(255, 255, 255))
draw2.text((phone_x2 - 70, phone_y1 + 20), "5G [|||]", font=small_font, fill=(255, 255, 255))

# Card inside smartphone screen
card_x1, card_y1, card_x2, card_y2 = phone_x1 + 30, phone_y1 + 220, phone_x2 - 30, phone_y1 + 460
draw2.rounded_rectangle([(card_x1, card_y1), (card_x2, card_y2)], radius=20, fill=(30, 41, 59), outline=(56, 189, 248), width=2)

# Badge
draw2.rounded_rectangle([(card_x1 + 65, card_y1 + 30), (card_x2 - 65, card_y1 + 60)], radius=8, fill=(15, 23, 42))
draw2.text((card_x1 + 80, card_y1 + 38), "REACT NATIVE MOBILE", font=small_font, fill=(56, 189, 248))

# Title
title_app = ImageFont.truetype(font_path, 22)
draw2.text((card_x1 + 45, card_y1 + 90), "Hello React Native", font=title_app, fill=(255, 255, 255))

# Subtitle
draw2.text((card_x1 + 30, card_y1 + 140), "Ung dung di dong dau tien cua toi\nChay muot ma tren ca Android & iOS", font=small_font, fill=(148, 163, 184))

# Bottom Home Indicator
draw2.rounded_rectangle([(phone_x1 + 120, phone_y2 - 18), (phone_x2 - 120, phone_y2 - 12)], radius=4, fill=(203, 213, 225))

path2 = os.path.join(OUTPUT_DIR, "hello_react_native.png")
img2.save(path2, "PNG")

print("Images generated successfully for BLT 5.")
