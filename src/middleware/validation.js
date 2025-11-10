const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false, // THÊM DÒNG NÀY
      status: 'error',
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
const validateLogin = [
  body('username').notEmpty().withMessage('Tên đăng nhập là bắt buộc'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  handleValidationErrors
];

const validateRegister = [
  // SỬA: Cho phép cả camelCase và PascalCase
  body('HoTen').optional().notEmpty().withMessage('Họ tên là bắt buộc'),
  body('hoTen').optional().notEmpty().withMessage('Họ tên là bắt buộc'),
  body('Email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('MatKhau').optional().isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('password').optional().isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('matKhau').optional().isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  handleValidationErrors
];

// Book validation
const validateBook = [
  body('TenSach').notEmpty().withMessage('Tên sách là bắt buộc'),
  body('TacGia').notEmpty().withMessage('Tác giả là bắt buộc'),
  body('GiaBan').isFloat({ min: 0 }).withMessage('Giá bán phải là số dương'),
  body('SoLuongTon').isInt({ min: 0 }).withMessage('Số lượng tồn phải là số nguyên không âm'),
  handleValidationErrors
];

// Category validation
const validateCategory = [
  body('TenDanMuc').notEmpty().withMessage('Tên danh mục là bắt buộc'),
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('MaKH').isInt({ min: 1 }).withMessage('Mã khách hàng không hợp lệ'),
  body('items').isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateRegister,
  validateBook,
  validateCategory,
  validateOrder,
  handleValidationErrors
};