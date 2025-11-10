// Mock data để phát triển frontend khi backend bị rate limiting
export const mockBooks = [
  {
    maSach: 1,
    tenSach: 'Nhà Giả Kim',
    tacGia: 'Paulo Coelho',
    theLoai: 'Tiểu thuyết',
    moTa: 'Câu chuyện về hành trình theo đuổi ước mơ của cậu bé chăn cừu Santiago',
    giaBan: 89000,
    soLuongTon: 50,
    anhBia: null,
    maDanMuc: 1
  },
  {
    maSach: 2,
    tenSach: 'Đắc Nhân Tâm',
    tacGia: 'Dale Carnegie',
    theLoai: 'Self-help',
    moTa: 'Nghệ thuật thu phục lòng người',
    giaBan: 75000,
    soLuongTon: 100,
    anhBia: null,
    maDanMuc: 2
  },
  {
    maSach: 3,
    tenSach: 'Sapiens',
    tacGia: 'Yuval Noah Harari',
    theLoai: 'Khoa học',
    moTa: 'Lược sử loài người',
    giaBan: 120000,
    soLuongTon: 30,
    anhBia: null,
    maDanMuc: 3
  },
  {
    maSach: 4,
    tenSach: 'Harry Potter và Hòn Đá Phù Thủy',
    tacGia: 'J.K. Rowling',
    theLoai: 'Fantasy',
    moTa: 'Câu chuyện về cậu bé phù thủy Harry Potter',
    giaBan: 110000,
    soLuongTon: 25,
    anhBia: null,
    maDanMuc: 1
  },
  {
    maSach: 5,
    tenSach: 'Clean Code',
    tacGia: 'Robert C. Martin',
    theLoai: 'Công nghệ',
    moTa: 'Nghệ thuật viết code sạch',
    giaBan: 150000,
    soLuongTon: 40,
    anhBia: null,
    maDanMuc: 2
  }
]

export const mockCategories = [
  {
    maDanMuc: 1,
    tenDanMuc: 'Sách Văn Học',
    moTa: 'Các tác phẩm văn học trong nước và quốc tế'
  },
  {
    maDanMuc: 2,
    tenDanMuc: 'Sách Kinh Tế',
    moTa: 'Sách về kinh doanh, tài chính, marketing'
  },
  {
    maDanMuc: 3,
    tenDanMuc: 'Sách Khoa Học',
    moTa: 'Sách khoa học công nghệ, nghiên cứu'
  }
]

export const mockCart = [
  {
    maSach: 1,
    tenSach: 'Nhà Giả Kim',
    tacGia: 'Paulo Coelho',
    giaBan: 89000,
    soLuong: 2,
    thanhTien: 178000,
    anhBia: null
  }
]

export const mockOrders = [
  {
    maDH: 1,
    ngayDat: '2024-01-15T10:30:00Z',
    tongTien: 267000,
    trangThaiDon: 'HoanThanh',
    ghiChu: 'Giao hàng giờ hành chính'
  }
]