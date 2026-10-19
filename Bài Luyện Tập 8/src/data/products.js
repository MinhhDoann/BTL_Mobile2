export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'iPhone 16 Pro Max 256GB',
    price: 34990000,
    formattedPrice: '34.990.000 ₫',
    category: 'Điện thoại',
    rating: 4.9,
    reviewsCount: 342,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    description: 'iPhone 16 Pro Max với thiết kế titan siêu bền và nhẹ, nút Điều Khiển Camera mới, chip A18 Pro mạnh mẽ vượt trội và thời lượng pin xuất sắc nhất từ trước đến nay.',
    specs: {
      screen: '6.9 inch Super Retina XDR',
      chip: 'Apple A18 Pro 6 nhân',
      ram: '8 GB',
      storage: '256 GB',
      battery: '4685 mAh, sạc nhanh 30W'
    }
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 29990000,
    formattedPrice: '29.990.000 ₫',
    category: 'Điện thoại',
    rating: 4.8,
    reviewsCount: 289,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    description: 'Galaxy AI quyền năng dẫn đầu kỷ nguyên mới. Thiết kế khung viền titan sang trọng, bút S-Pen tích hợp và camera zoom 100x với độ phân giải lên đến 200MP.',
    specs: {
      screen: '6.8 inch Dynamic AMOLED 2X',
      chip: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12 GB',
      storage: '256 GB',
      battery: '5000 mAh, sạc siêu nhanh 45W'
    }
  },
  {
    id: '3',
    name: 'MacBook Pro 14" M3 Pro',
    price: 49990000,
    formattedPrice: '49.990.000 ₫',
    category: 'Laptop',
    rating: 4.9,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    description: 'Đỉnh cao sức mạnh chuyên nghiệp với chip Apple M3 Pro, màn hình Liquid Retina XDR 120Hz rực rỡ và cổng kết nối đa dạng cho mọi tác vụ sáng tạo.',
    specs: {
      screen: '14.2 inch Liquid Retina XDR',
      chip: 'Apple M3 Pro 11-core CPU',
      ram: '18 GB Unified Memory',
      storage: '512 GB SSD siêu tốc',
      battery: 'Thời lượng pin lên đến 18 giờ'
    }
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Chống Ồn',
    price: 7990000,
    formattedPrice: '7.990.000 ₫',
    category: 'Tai nghe',
    rating: 4.9,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Tai nghe chụp tai chống ồn hàng đầu thế giới với bộ xử lý Integrated Processor V1, 8 micro thu âm và âm thanh Hi-Res Audio đỉnh cao.',
    specs: {
      type: 'Over-ear không dây',
      battery: '30 giờ (bật ANC), 40 giờ (tắt ANC)',
      bluetooth: 'Bluetooth 5.2, hỗ trợ LDAC',
      weight: '250 g nhẹ êm cả ngày'
    }
  },
  {
    id: '5',
    name: 'Apple Watch Series 10 Titanium',
    price: 19990000,
    formattedPrice: '19.990.000 ₫',
    category: 'Đồng hồ',
    rating: 4.7,
    reviewsCount: 198,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    description: 'Chiếc Apple Watch mỏng nhất từ trước đến nay với màn hình lớn hơn cả Ultra 2, cảm biến sức khỏe tiên tiến theo dõi chứng ngưng thở khi ngủ.',
    specs: {
      screen: 'OLED góc nhìn rộng sáng rõ',
      case: 'Vỏ Titan chuẩn hàng không vũ trụ',
      sensors: 'Điện tâm đồ ECG, đo oxy máu SpO2',
      waterproof: 'Chống nước 50m bơi lội thoải mái'
    }
  },
  {
    id: '6',
    name: 'iPad Pro 11" M4 Siêu Mỏng',
    price: 27990000,
    formattedPrice: '27.990.000 ₫',
    category: 'Máy tính bảng',
    rating: 4.8,
    reviewsCount: 114,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    description: 'Độ mỏng kinh ngạc chỉ 5.3mm kết hợp cùng màn hình Ultra Retina XDR Tandem OLED đột phá và sức mạnh vô song của chip M4 thế hệ mới.',
    specs: {
      screen: '11 inch Tandem OLED Ultra Retina',
      chip: 'Apple M4 chip thế hệ mới',
      ram: '8 GB',
      storage: '256 GB',
      support: 'Apple Pencil Pro & Magic Keyboard'
    }
  },
  {
    id: '7',
    name: 'AirPods Pro Gen 2 (USB-C)',
    price: 5490000,
    formattedPrice: '5.490.000 ₫',
    category: 'Tai nghe',
    rating: 4.8,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    description: 'Chống ồn chủ động gấp 2 lần, tính năng Nhận Biết Cuộc Trò Chuyện thông minh và hộp sạc chuẩn USB-C có khả năng chống bụi và nước IP54.',
    specs: {
      chip: 'Apple H2 headphone chip',
      battery: '6 giờ nghe liên tục (30 giờ với hộp)',
      charging: 'Cổng Type-C & sạc MagSafe không dây'
    }
  },
  {
    id: '8',
    name: 'Bàn phím cơ Keychron Q1 Pro',
    price: 4390000,
    formattedPrice: '4.390.000 ₫',
    category: 'Phụ kiện',
    rating: 4.9,
    reviewsCount: 78,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Bàn phím cơ Custom không dây full nhôm CNC, kết cấu Gasket Mount êm ái, switch hotswap và hỗ trợ tùy biến QMK/VIA mượt mà.',
    specs: {
      layout: '75% nhỏ gọn tinh tế',
      connectivity: 'Bluetooth 5.1 & Type-C có dây',
      structure: 'Double Gasket Mount cao cấp',
      compatibility: 'Tương thích hoàn hảo macOS / Windows'
    }
  },
  {
    id: '9',
    name: 'Chuột Logitech MX Master 3S',
    price: 2490000,
    formattedPrice: '2.490.000 ₫',
    category: 'Phụ kiện',
    rating: 4.9,
    reviewsCount: 630,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    description: 'Chuột công thái học biểu tượng cho lập trình viên và nhà thiết kế. Con lăn cơ học MagSpeed cuộn 1000 dòng/giây cùng cú nhấp Silent Clicks cực êm.',
    specs: {
      dpi: '8000 DPI cảm biến Darkfield',
      battery: 'Pin sạc dùng tới 70 ngày',
      connection: 'Logi Bolt & Bluetooth kết nối 3 thiết bị'
    }
  },
  {
    id: '10',
    name: 'Loa Marshall Stanmore III',
    price: 9490000,
    formattedPrice: '9.490.000 ₫',
    category: 'Loa',
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    description: 'Âm thanh không gian rộng hơn với âm trường mở rộng, thiết kế cổ điển phong cách Rock & Roll trường tồn cùng kết nối Bluetooth 5.2 tiên tiến.',
    specs: {
      power: 'Tổng công suất 80W uy lực',
      connectivity: 'Bluetooth 5.2, AUX 3.5mm, RCA',
      dimensions: '350 x 203 x 188 mm, 4.25 kg'
    }
  }
];

// 3 sản phẩm mẫu dành riêng cho Bài tập mức Dễ
export const EASY_SAMPLE_PRODUCTS = [
  {
    id: 'easy-1',
    name: 'Bình giữ nhiệt Lock&Lock 500ml',
    price: 290000,
    formattedPrice: '290.000 ₫',
    category: 'Đồ gia dụng',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'easy-2',
    name: 'Cáp sạc nhanh Anker Type-C to Lightning',
    price: 180000,
    formattedPrice: '180.000 ₫',
    category: 'Phụ kiện',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'easy-3',
    name: 'Sạc dự phòng Baseus 20.000mAh 65W',
    price: 750000,
    formattedPrice: '750.000 ₫',
    category: 'Phụ kiện',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=500&auto=format&fit=crop&q=80'
  }
];
