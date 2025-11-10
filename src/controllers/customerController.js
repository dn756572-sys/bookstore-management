const { poolPromise, sql } = require('../config/database');
const { getPagination, hashPassword } = require('../utils/helpers');

const getAllCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    let whereConditions = ['1=1'];
    let inputParams = {};

    if (search) {
      whereConditions.push('(HoTen LIKE @search OR Email LIKE @search OR SoDienThoai LIKE @search)');
      inputParams.search = `%${search}%`;
    }

    if (status !== '') {
      whereConditions.push('TrangThai = @status');
      inputParams.status = parseInt(status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build request
    let request = pool.request();
    Object.keys(inputParams).forEach(key => {
      if (key === 'status') {
        request = request.input(key, sql.Int, inputParams[key]);
      } else {
        request = request.input(key, sql.NVarChar, inputParams[key]);
      }
    });

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM KHACHHANG ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Get customers with pagination
    const result = await request
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT 
          MaKH, HoTen, Email, SoDienThoai, DiaChi, 
          NgayDangKy, TrangThai,
          (SELECT COUNT(*) FROM DONHANG WHERE MaKH = KHACHHANG.MaKH) as TongDonHang,
          (SELECT SUM(TongTien) FROM DONHANG WHERE MaKH = KHACHHANG.MaKH AND TrangThaiDon = 'HoanThanh') as TongChiTieu
        FROM KHACHHANG 
        ${whereClause}
        ORDER BY MaKH DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        customers: result.recordset,
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

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaKH', sql.Int, id)
      .query(`
        SELECT 
          MaKH, HoTen, Email, SoDienThoai, DiaChi, 
          NgayDangKy, TrangThai
        FROM KHACHHANG 
        WHERE MaKH = @MaKH
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Get customer's orders
    const ordersResult = await pool.request()
      .input('MaKH', sql.Int, id)
      .query(`
        SELECT 
          MaDH, NgayDat, TongTien, TrangThaiDon, GhiChu
        FROM DONHANG 
        WHERE MaKH = @MaKH
        ORDER BY NgayDat DESC
      `);

    const customer = result.recordset[0];
    customer.DonHang = ordersResult.recordset;

    res.status(200).json({
      status: 'success',
      data: {
        customer
      }
    });

  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { HoTen, Email, MatKhau, SoDienThoai, DiaChi } = req.body;
    const pool = await poolPromise;

    // Check if email already exists
    const existingCustomer = await pool.request()
      .input('Email', sql.NVarChar, Email)
      .query('SELECT MaKH FROM KHACHHANG WHERE Email = @Email');

    if (existingCustomer.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(MatKhau);

    const result = await pool.request()
      .input('HoTen', sql.NVarChar, HoTen)
      .input('Email', sql.NVarChar, Email)
      .input('MatKhau', sql.NVarChar, hashedPassword)
      .input('SoDienThoai', sql.NVarChar, SoDienThoai)
      .input('DiaChi', sql.NVarChar, DiaChi)
      .query(`
        INSERT INTO KHACHHANG (HoTen, Email, MatKhau, SoDienThoai, DiaChi)
        OUTPUT INSERTED.MaKH, INSERTED.HoTen, INSERTED.Email, INSERTED.SoDienThoai, INSERTED.DiaChi, INSERTED.NgayDangKy, INSERTED.TrangThai
        VALUES (@HoTen, @Email, @MatKhau, @SoDienThoai, @DiaChi)
      `);

    const newCustomer = result.recordset[0];

    res.status(201).json({
      status: 'success',
      message: 'Thêm khách hàng thành công',
      data: {
        customer: newCustomer
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { HoTen, Email, SoDienThoai, DiaChi, TrangThai } = req.body;
    const pool = await poolPromise;

    // Check if customer exists
    const existingCustomer = await pool.request()
      .input('MaKH', sql.Int, id)
      .query('SELECT MaKH FROM KHACHHANG WHERE MaKH = @MaKH');

    if (existingCustomer.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Check if email already exists (excluding current customer)
    const duplicateCustomer = await pool.request()
      .input('MaKH', sql.Int, id)
      .input('Email', sql.NVarChar, Email)
      .query('SELECT MaKH FROM KHACHHANG WHERE Email = @Email AND MaKH != @MaKH');

    if (duplicateCustomer.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã được sử dụng'
      });
    }

    const result = await pool.request()
      .input('MaKH', sql.Int, id)
      .input('HoTen', sql.NVarChar, HoTen)
      .input('Email', sql.NVarChar, Email)
      .input('SoDienThoai', sql.NVarChar, SoDienThoai)
      .input('DiaChi', sql.NVarChar, DiaChi)
      .input('TrangThai', sql.Bit, TrangThai)
      .query(`
        UPDATE KHACHHANG 
        SET HoTen = @HoTen, Email = @Email, SoDienThoai = @SoDienThoai, 
            DiaChi = @DiaChi, TrangThai = @TrangThai
        OUTPUT INSERTED.MaKH, INSERTED.HoTen, INSERTED.Email, INSERTED.SoDienThoai, 
               INSERTED.DiaChi, INSERTED.NgayDangKy, INSERTED.TrangThai
        WHERE MaKH = @MaKH
      `);

    const updatedCustomer = result.recordset[0];

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật khách hàng thành công',
      data: {
        customer: updatedCustomer
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TrangThai } = req.body;
    const pool = await poolPromise;

    // Check if customer exists
    const existingCustomer = await pool.request()
      .input('MaKH', sql.Int, id)
      .query('SELECT MaKH FROM KHACHHANG WHERE MaKH = @MaKH');

    if (existingCustomer.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy khách hàng'
      });
    }

    await pool.request()
      .input('MaKH', sql.Int, id)
      .input('TrangThai', sql.Bit, TrangThai)
      .query('UPDATE KHACHHANG SET TrangThai = @TrangThai WHERE MaKH = @MaKH');

    res.status(200).json({
      status: 'success',
      message: `Đã ${TrangThai ? 'kích hoạt' : 'vô hiệu hóa'} khách hàng thành công`
    });

  } catch (error) {
    next(error);
  }
};

const getCustomerStats = async (req, res, next) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as TongKhachHang,
        SUM(CASE WHEN TrangThai = 1 THEN 1 ELSE 0 END) as KhachHangHoatDong,
        SUM(CASE WHEN TrangThai = 0 THEN 1 ELSE 0 END) as KhachHangVoHieuHoa,
        COUNT(DISTINCT MaKH) as KhachHangCoDonHang,
        AVG(TongChiTieu) as ChiTieuTrungBinh
      FROM (
        SELECT 
          k.MaKH,
          k.TrangThai,
          COALESCE(SUM(d.TongTien), 0) as TongChiTieu
        FROM KHACHHANG k
        LEFT JOIN DONHANG d ON k.MaKH = d.MaKH AND d.TrangThaiDon = 'HoanThanh'
        GROUP BY k.MaKH, k.TrangThai
      ) as CustomerStats
    `);

    // Get top customers
    const topCustomersResult = await pool.request().query(`
      SELECT TOP 10
        k.MaKH,
        k.HoTen,
        k.Email,
        COUNT(d.MaDH) as TongDonHang,
        SUM(CASE WHEN d.TrangThaiDon = 'HoanThanh' THEN d.TongTien ELSE 0 END) as TongChiTieu
      FROM KHACHHANG k
      LEFT JOIN DONHANG d ON k.MaKH = d.MaKH
      WHERE k.TrangThai = 1
      GROUP BY k.MaKH, k.HoTen, k.Email
      ORDER BY TongChiTieu DESC
    `);

    res.status(200).json({
      status: 'success',
      data: {
        stats: result.recordset[0],
        topCustomers: topCustomersResult.recordset
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  getCustomerStats
};