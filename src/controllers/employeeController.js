const { poolPromise, sql } = require('../config/database');
const { getPagination, hashPassword } = require('../utils/helpers');

const getAllEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    let whereConditions = ['1=1'];
    let inputParams = {};

    if (search) {
      whereConditions.push('(HoTen LIKE @search OR TenDangNhap LIKE @search)');
      inputParams.search = `%${search}%`;
    }

    if (role) {
      whereConditions.push('VaiTro = @role');
      inputParams.role = role;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build request
    let request = pool.request();
    Object.keys(inputParams).forEach(key => {
      request = request.input(key, sql.NVarChar, inputParams[key]);
    });

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM NHANVIEN ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Get employees with pagination
    const result = await request
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT 
          MaNhanVien, TenDangNhap, HoTen, VaiTro,
          (SELECT COUNT(*) FROM DONHANG WHERE MaNhanVien = NHANVIEN.MaNhanVien) as TongDonXuLy
        FROM NHANVIEN 
        ${whereClause}
        ORDER BY MaNhanVien DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        employees: result.recordset,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .query(`
        SELECT 
          MaNhanVien, TenDangNhap, HoTen, VaiTro
        FROM NHANVIEN 
        WHERE MaNhanVien = @MaNhanVien
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhân viên'
      });
    }

    // Get employee's processed orders
    const ordersResult = await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .query(`
        SELECT 
          COUNT(*) as TongDonHang,
          SUM(TongTien) as TongGiaTriDonHang,
          AVG(TongTien) as GiaTriDonHangTrungBinh
        FROM DONHANG 
        WHERE MaNhanVien = @MaNhanVien
      `);

    const employee = result.recordset[0];
    employee.thongKeDonHang = ordersResult.recordset[0];

    res.status(200).json({
      status: 'success',
      data: {
        employee
      }
    });

  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { TenDangNhap, MatKhau, HoTen, VaiTro } = req.body;
    const pool = await poolPromise;

    // Check if username already exists
    const existingEmployee = await pool.request()
      .input('TenDangNhap', sql.NVarChar, TenDangNhap)
      .query('SELECT MaNhanVien FROM NHANVIEN WHERE TenDangNhap = @TenDangNhap');

    if (existingEmployee.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên đăng nhập đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(MatKhau);

    const result = await pool.request()
      .input('TenDangNhap', sql.NVarChar, TenDangNhap)
      .input('MatKhau', sql.NVarChar, hashedPassword)
      .input('HoTen', sql.NVarChar, HoTen)
      .input('VaiTro', sql.NVarChar, VaiTro || 'NhanVien')
      .query(`
        INSERT INTO NHANVIEN (TenDangNhap, MatKhau, HoTen, VaiTro)
        OUTPUT INSERTED.MaNhanVien, INSERTED.TenDangNhap, INSERTED.HoTen, INSERTED.VaiTro
        VALUES (@TenDangNhap, @MatKhau, @HoTen, @VaiTro)
      `);

    const newEmployee = result.recordset[0];

    res.status(201).json({
      status: 'success',
      message: 'Thêm nhân viên thành công',
      data: {
        employee: newEmployee
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenDangNhap, HoTen, VaiTro, MatKhau } = req.body;
    const pool = await poolPromise;

    // Check if employee exists
    const existingEmployee = await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .query('SELECT MaNhanVien FROM NHANVIEN WHERE MaNhanVien = @MaNhanVien');

    if (existingEmployee.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhân viên'
      });
    }

    // Check if username already exists (excluding current employee)
    const duplicateEmployee = await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .input('TenDangNhap', sql.NVarChar, TenDangNhap)
      .query('SELECT MaNhanVien FROM NHANVIEN WHERE TenDangNhap = @TenDangNhap AND MaNhanVien != @MaNhanVien');

    if (duplicateEmployee.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên đăng nhập đã được sử dụng'
      });
    }

    let query = '';
    let request = pool.request()
      .input('MaNhanVien', sql.Int, id)
      .input('TenDangNhap', sql.NVarChar, TenDangNhap)
      .input('HoTen', sql.NVarChar, HoTen)
      .input('VaiTro', sql.NVarChar, VaiTro);

    if (MatKhau) {
      const hashedPassword = await hashPassword(MatKhau);
      query = `
        UPDATE NHANVIEN 
        SET TenDangNhap = @TenDangNhap, HoTen = @HoTen, VaiTro = @VaiTro, MatKhau = @MatKhau
        OUTPUT INSERTED.MaNhanVien, INSERTED.TenDangNhap, INSERTED.HoTen, INSERTED.VaiTro
        WHERE MaNhanVien = @MaNhanVien
      `;
      request = request.input('MatKhau', sql.NVarChar, hashedPassword);
    } else {
      query = `
        UPDATE NHANVIEN 
        SET TenDangNhap = @TenDangNhap, HoTen = @HoTen, VaiTro = @VaiTro
        OUTPUT INSERTED.MaNhanVien, INSERTED.TenDangNhap, INSERTED.HoTen, INSERTED.VaiTro
        WHERE MaNhanVien = @MaNhanVien
      `;
    }

    const result = await request.query(query);
    const updatedEmployee = result.recordset[0];

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật nhân viên thành công',
      data: {
        employee: updatedEmployee
      }
    });

  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Check if employee exists
    const existingEmployee = await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .query('SELECT MaNhanVien FROM NHANVIEN WHERE MaNhanVien = @MaNhanVien');

    if (existingEmployee.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhân viên'
      });
    }

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa tài khoản của chính mình'
      });
    }

    // Check if employee has processed orders
    const ordersCheck = await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .query('SELECT COUNT(*) as orderCount FROM DONHANG WHERE MaNhanVien = @MaNhanVien');

    if (ordersCheck.recordset[0].orderCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa nhân viên đã xử lý đơn hàng'
      });
    }

    await pool.request()
      .input('MaNhanVien', sql.Int, id)
      .query('DELETE FROM NHANVIEN WHERE MaNhanVien = @MaNhanVien');

    res.status(200).json({
      status: 'success',
      message: 'Xóa nhân viên thành công'
    });

  } catch (error) {
    next(error);
  }
};

const getEmployeeStats = async (req, res, next) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as TongNhanVien,
        SUM(CASE WHEN VaiTro = 'Admin' THEN 1 ELSE 0 END) as SoAdmin,
        SUM(CASE WHEN VaiTro = 'QuanLy' THEN 1 ELSE 0 END) as SoQuanLy,
        SUM(CASE WHEN VaiTro = 'NhanVien' THEN 1 ELSE 0 END) as SoNhanVien
      FROM NHANVIEN
    `);

    // Get top employees by orders processed
    const topEmployeesResult = await pool.request().query(`
      SELECT TOP 5
        n.MaNhanVien,
        n.HoTen,
        n.VaiTro,
        COUNT(d.MaDH) as SoDonDaXuLy,
        SUM(d.TongTien) as TongGiaTriDonHang
      FROM NHANVIEN n
      LEFT JOIN DONHANG d ON n.MaNhanVien = d.MaNhanVien
      GROUP BY n.MaNhanVien, n.HoTen, n.VaiTro
      ORDER BY SoDonDaXuLy DESC
    `);

    res.status(200).json({
      status: 'success',
      data: {
        stats: result.recordset[0],
        topEmployees: topEmployeesResult.recordset
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
};