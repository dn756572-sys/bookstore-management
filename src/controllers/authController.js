const { poolPromise, sql } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt for:', username);

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
      });
    }

    const pool = await poolPromise;

    // Check if user exists in employee table
    let result = await pool.request()
      .input('TenDangNhap', sql.NVarChar, username)
      .query('SELECT * FROM NHANVIEN WHERE TenDangNhap = @TenDangNhap');

    let user = result.recordset[0];
    let role = 'employee';

    // If not found in employee table, check customer table
    if (!user) {
      result = await pool.request()
        .input('Email', sql.NVarChar, username)
        .query('SELECT * FROM KHACHHANG WHERE Email = @Email AND TrangThai = 1');
      
      user = result.recordset[0];
      role = 'customer';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        status: 'error',
        message: 'Tên đăng nhập hoặc email không tồn tại'
      });
    }

    console.log('User found:', { id: user.MaKH || user.MaNhanVien, role });

    // Compare password - Handle both hashed and plain text passwords
    let isPasswordValid = false;
    
    if (user.MatKhau && (user.MatKhau.startsWith('$2b$') || user.MatKhau.startsWith('$2a$'))) {
      // Password is hashed
      isPasswordValid = await comparePassword(password, user.MatKhau);
    } else {
      // Password is plain text (for existing data)
      isPasswordValid = password === user.MatKhau;
      
      // Auto-upgrade to hashed password
      if (isPasswordValid) {
        const hashedPassword = await hashPassword(password);
        if (role === 'customer') {
          await pool.request()
            .input('MaKH', sql.Int, user.MaKH)
            .input('MatKhau', sql.NVarChar, hashedPassword)
            .query('UPDATE KHACHHANG SET MatKhau = @MatKhau WHERE MaKH = @MaKH');
          console.log('Auto-upgraded customer password to hashed');
        } else {
          await pool.request()
            .input('MaNhanVien', sql.Int, user.MaNhanVien)
            .input('MatKhau', sql.NVarChar, hashedPassword)
            .query('UPDATE NHANVIEN SET MatKhau = @MatKhau WHERE MaNhanVien = @MaNhanVien');
          console.log('Auto-upgraded employee password to hashed');
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        status: 'error',
        message: 'Mật khẩu không chính xác'
      });
    }

    // Generate token
    const token = generateToken({
      id: role === 'customer' ? user.MaKH : user.MaNhanVien,
      role: role
    });

    // Prepare user data for response
    const userData = {
      id: role === 'customer' ? user.MaKH : user.MaNhanVien,
      name: user.HoTen,
      email: user.Email || user.TenDangNhap,
      role: role
    };

    if (role === 'employee') {
      userData.vaiTro = user.VaiTro;
    }

    console.log('Login successful for user:', userData);

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Lỗi server khi đăng nhập'
    });
  }
};

const register = async (req, res, next) => {
  try {
    // SỬA: Nhận cả camelCase và PascalCase
    const { 
      HoTen, hoTen, 
      Email, email, 
      MatKhau, matKhau, password,
      SoDienThoai, soDienThoai,
      DiaChi, diaChi 
    } = req.body;

    // SỬA: Chuẩn hóa field names
    const normalizedData = {
      HoTen: HoTen || hoTen,
      Email: Email || email,
      MatKhau: MatKhau || matKhau || password, // Nhận cả password từ frontend
      SoDienThoai: SoDienThoai || soDienThoai,
      DiaChi: DiaChi || diaChi
    };

    const { HoTen: finalHoTen, Email: finalEmail, MatKhau: finalMatKhau, SoDienThoai: finalSoDienThoai, DiaChi: finalDiaChi } = normalizedData;

    console.log('Register attempt for:', finalEmail);
    console.log('Received data:', normalizedData);

    // Validate required fields
    if (!finalHoTen || !finalEmail || !finalMatKhau) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Email, Mật khẩu)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Email không hợp lệ'
      });
    }

    const pool = await poolPromise;

    // Check if email already exists
    const existingUser = await pool.request()
      .input('Email', sql.NVarChar, finalEmail)
      .query('SELECT MaKH FROM KHACHHANG WHERE Email = @Email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(finalMatKhau);

    // Insert new customer
    const result = await pool.request()
      .input('HoTen', sql.NVarChar, finalHoTen)
      .input('Email', sql.NVarChar, finalEmail)
      .input('MatKhau', sql.NVarChar, hashedPassword)
      .input('SoDienThoai', sql.NVarChar, finalSoDienThoai || '')
      .input('DiaChi', sql.NVarChar, finalDiaChi || '')
      .query(`
        INSERT INTO KHACHHANG (HoTen, Email, MatKhau, SoDienThoai, DiaChi)
        OUTPUT INSERTED.MaKH, INSERTED.HoTen, INSERTED.Email, INSERTED.SoDienThoai, INSERTED.DiaChi, INSERTED.NgayDangKy, INSERTED.TrangThai
        VALUES (@HoTen, @Email, @MatKhau, @SoDienThoai, @DiaChi)
      `);

    const newCustomer = result.recordset[0];

    // Generate token
    const token = generateToken({
      id: newCustomer.MaKH,
      role: 'customer'
    });

    const userResponse = {
      id: newCustomer.MaKH,
      name: newCustomer.HoTen,
      email: newCustomer.Email,
      role: 'customer'
    };

    console.log('Register successful for customer:', userResponse);

    res.status(201).json({
      success: true,
      status: 'success',
      message: 'Đăng ký tài khoản thành công',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    // Handle specific SQL errors
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Email đã được sử dụng'
      });
    }
    
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Lỗi server khi đăng ký: ' + error.message
    });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const pool = await poolPromise;

    let user;

    if (role === 'customer') {
      const result = await pool.request()
        .input('MaKH', sql.Int, id)
        .query(`
          SELECT MaKH, HoTen, Email, SoDienThoai, DiaChi, NgayDangKy, TrangThai 
          FROM KHACHHANG 
          WHERE MaKH = @MaKH
        `);
      user = result.recordset[0];
    } else {
      const result = await pool.request()
        .input('MaNhanVien', sql.Int, id)
        .query(`
          SELECT MaNhanVien, TenDangNhap, HoTen, VaiTro 
          FROM NHANVIEN 
          WHERE MaNhanVien = @MaNhanVien
        `);
      user = result.recordset[0];
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'Người dùng không tồn tại'
      });
    }

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        user: {
          ...user,
          role: role
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Lỗi server khi lấy thông tin người dùng'
    });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Vui lòng nhập đầy đủ mật khẩu'
      });
    }

    const pool = await poolPromise;

    // Get current user with password
    let tableName = role === 'customer' ? 'KHACHHANG' : 'NHANVIEN';
    let idField = role === 'customer' ? 'MaKH' : 'MaNhanVien';

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT MatKhau FROM ${tableName} WHERE ${idField} = @id`);

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'Người dùng không tồn tại'
      });
    }

    // Verify current password
    let isCurrentPasswordValid = false;
    
    if (user.MatKhau.startsWith('$2b$') || user.MatKhau.startsWith('$2a$')) {
      isCurrentPasswordValid = await comparePassword(currentPassword, user.MatKhau);
    } else {
      isCurrentPasswordValid = currentPassword === user.MatKhau;
    }

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await pool.request()
      .input('id', sql.Int, id)
      .input('MatKhau', sql.NVarChar, hashedNewPassword)
      .query(`UPDATE ${tableName} SET MatKhau = @MatKhau WHERE ${idField} = @id`);

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Lỗi server khi đổi mật khẩu'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  changePassword
};