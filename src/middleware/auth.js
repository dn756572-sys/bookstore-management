const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/database');

const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Vui lòng đăng nhập để truy cập tài nguyên này'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const pool = await poolPromise;
    let user;
    
    if (decoded.role === 'customer') {
      const result = await pool.request()
        .input('MaKH', sql.Int, decoded.id)
        .query('SELECT MaKH, HoTen, Email, TrangThai FROM KHACHHANG WHERE MaKH = @MaKH');
      user = result.recordset[0];
    } else {
      const result = await pool.request()
        .input('MaNhanVien', sql.Int, decoded.id)
        .query('SELECT MaNhanVien, HoTen, TenDangNhap, VaiTro FROM NHANVIEN WHERE MaNhanVien = @MaNhanVien');
      user = result.recordset[0];
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Người dùng không tồn tại'
      });
    }

    // SỬA QUAN TRỌNG: Đối với employee, sử dụng VaiTro từ database thay vì role từ token
    const userRole = decoded.role === 'employee' ? user.VaiTro : decoded.role;

    // Add user to request
    req.user = {
      id: decoded.role === 'customer' ? user.MaKH : user.MaNhanVien,
      name: user.HoTen,
      email: user.Email || user.TenDangNhap,
      role: userRole // Sử dụng role đã được sửa
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    next();
  };
};

module.exports = {
  auth,
  authorize
};