// Application constants
export const APP_CONFIG = {
  NAME: 'BookStore Management',
  VERSION: '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
}

// Order status constants
export const ORDER_STATUS = {
  CHO_XAC_NHAN: 'ChoXacNhan',
  DANG_XU_LY: 'DangXuLy',
  DANG_GIAO: 'DangGiao',
  HOAN_THANH: 'HoanThanh',
  HUY: 'Huy'
}

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.CHO_XAC_NHAN]: 'Chờ xác nhận',
  [ORDER_STATUS.DANG_XU_LY]: 'Đang xử lý',
  [ORDER_STATUS.DANG_GIAO]: 'Đang giao',
  [ORDER_STATUS.HOAN_THANH]: 'Hoàn thành',
  [ORDER_STATUS.HUY]: 'Đã hủy'
}

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.CHO_XAC_NHAN]: 'warning',
  [ORDER_STATUS.DANG_XU_LY]: 'info',
  [ORDER_STATUS.DANG_GIAO]: 'primary',
  [ORDER_STATUS.HOAN_THANH]: 'success',
  [ORDER_STATUS.HUY]: 'danger'
}

// Payment methods
export const PAYMENT_METHODS = {
  COD: 'COD',
  CHUYEN_KHOAN: 'ChuyenKhoan',
  VI_DIEN_TU: 'ViDienTu'
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng',
  [PAYMENT_METHODS.CHUYEN_KHOAN]: 'Chuyển khoản ngân hàng',
  [PAYMENT_METHODS.VI_DIEN_TU]: 'Ví điện tử'
}

// User roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  QUAN_LY: 'QuanLy',
  NHAN_VIEN: 'NhanVien',
  KHACH_HANG: 'KhachHang'
}

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.QUAN_LY]: 'Quản lý',
  [USER_ROLES.NHAN_VIEN]: 'Nhân viên',
  [USER_ROLES.KHACH_HANG]: 'Khách hàng'
}

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  PAGE_SIZES: [10, 20, 50, 100]
}

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(0|\+84)(\d{9,10})$/,
  PASSWORD_MIN_LENGTH: 6
}

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart'
}