const { poolPromise, sql } = require('../config/database');
const { getPagination, generateOrderCode } = require('../utils/helpers');

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', fromDate = '', toDate = '' } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    let whereConditions = ['1=1'];
    let inputParams = {};

    if (status) {
      whereConditions.push('TrangThaiDon = @status');
      inputParams.status = status;
    }

    if (fromDate) {
      whereConditions.push('CONVERT(DATE, NgayDat) >= @fromDate');
      inputParams.fromDate = fromDate;
    }

    if (toDate) {
      whereConditions.push('CONVERT(DATE, NgayDat) <= @toDate');
      inputParams.toDate = toDate;
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build request
    let request = pool.request();
    Object.keys(inputParams).forEach(key => {
      request = request.input(key, sql.NVarChar, inputParams[key]);
    });

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM DONHANG ${whereClause}
    `);
    const total = countResult.recordset[0].total;

    // Get orders with pagination
    const result = await request
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT 
          d.MaDH,
          d.NgayDat,
          d.TongTien,
          d.TrangThaiDon,
          d.GhiChu,
          d.MaNhanVien,
          d.MaKH,
          k.HoTen as TenKhachHang,
          k.Email as EmailKhachHang,
          n.HoTen as TenNhanVien,
          (SELECT COUNT(*) FROM CTDONHANG WHERE MaDH = d.MaDH) as SoLuongSanPham
        FROM DONHANG d
        LEFT JOIN KHACHHANG k ON d.MaKH = k.MaKH
        LEFT JOIN NHANVIEN n ON d.MaNhanVien = n.MaNhanVien
        ${whereClause}
        ORDER BY d.NgayDat DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        orders: result.recordset,
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

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Get order basic info
    const orderResult = await pool.request()
      .input('MaDH', sql.Int, id)
      .query(`
        SELECT 
          d.*,
          k.HoTen as TenKhachHang,
          k.Email as EmailKhachHang,
          k.SoDienThoai,
          k.DiaChi,
          n.HoTen as TenNhanVien
        FROM DONHANG d
        LEFT JOIN KHACHHANG k ON d.MaKH = k.MaKH
        LEFT JOIN NHANVIEN n ON d.MaNhanVien = n.MaNhanVien
        WHERE d.MaDH = @MaDH
      `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Get order items
    const itemsResult = await pool.request()
      .input('MaDH', sql.Int, id)
      .query(`
        SELECT 
          c.MaSach,
          c.SoLuong,
          c.DonGia,
          c.ThanhTien,
          s.TenSach,
          s.TacGia,
          s.AnhBia
        FROM CTDONHANG c
        INNER JOIN SACH s ON c.MaSach = s.MaSach
        WHERE c.MaDH = @MaDH
      `);

    // Get payment info
    const paymentResult = await pool.request()
      .input('MaDH', sql.Int, id)
      .query(`
        SELECT 
          MaThanhToan,
          PhuongThuc,
          SoTien,
          TrangThai as TrangThaiThanhToan,
          NgayThanhToan
        FROM THANHTOAN 
        WHERE MaDH = @MaDH
      `);

    const order = orderResult.recordset[0];
    order.items = itemsResult.recordset;
    order.payment = paymentResult.recordset[0] || null;

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });

  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  const transaction = new sql.Transaction(await poolPromise);
  
  try {
    await transaction.begin();

    const { MaKH, items, GhiChu, PhuongThucThanhToan = 'COD' } = req.body;
    const MaNhanVien = req.user.role !== 'customer' ? req.user.id : null;

    // Calculate total amount and validate items
    let TongTien = 0;
    const orderItems = [];

    for (const item of items) {
      const bookResult = await transaction.request()
        .input('MaSach', sql.Int, item.MaSach)
        .query('SELECT TenSach, GiaBan, SoLuongTon FROM SACH WHERE MaSach = @MaSach');

      if (bookResult.recordset.length === 0) {
        throw new Error(`Sách với mã ${item.MaSach} không tồn tại`);
      }

      const book = bookResult.recordset[0];

      if (book.SoLuongTon < item.SoLuong) {
        throw new Error(`Sách "${book.TenSach}" chỉ còn ${book.SoLuongTon} sản phẩm`);
      }

      const ThanhTien = book.GiaBan * item.SoLuong;
      TongTien += ThanhTien;

      orderItems.push({
        MaSach: item.MaSach,
        SoLuong: item.SoLuong,
        DonGia: book.GiaBan,
        ThanhTien: ThanhTien
      });
    }

    if (orderItems.length === 0) {
      throw new Error('Đơn hàng phải có ít nhất 1 sản phẩm');
    }

    // Create order
    const orderResult = await transaction.request()
      .input('MaKH', sql.Int, MaKH)
      .input('MaNhanVien', sql.Int, MaNhanVien)
      .input('TongTien', sql.Decimal(18, 2), TongTien)
      .input('GhiChu', sql.NVarChar, GhiChu)
      .query(`
        INSERT INTO DONHANG (MaKH, MaNhanVien, TongTien, GhiChu)
        OUTPUT INSERTED.*
        VALUES (@MaKH, @MaNhanVien, @TongTien, @GhiChu)
      `);

    const newOrder = orderResult.recordset[0];

    // Create order items and update book quantities
    for (const item of orderItems) {
      await transaction.request()
        .input('MaDH', sql.Int, newOrder.MaDH)
        .input('MaSach', sql.Int, item.MaSach)
        .input('SoLuong', sql.Int, item.SoLuong)
        .input('DonGia', sql.Decimal(18, 2), item.DonGia)
        .input('ThanhTien', sql.Decimal(18, 2), item.ThanhTien)
        .query(`
          INSERT INTO CTDONHANG (MaDH, MaSach, SoLuong, DonGia, ThanhTien)
          VALUES (@MaDH, @MaSach, @SoLuong, @DonGia, @ThanhTien)
        `);

      // Update book quantity
      await transaction.request()
        .input('MaSach', sql.Int, item.MaSach)
        .input('SoLuong', sql.Int, item.SoLuong)
        .query('UPDATE SACH SET SoLuongTon = SoLuongTon - @SoLuong WHERE MaSach = @MaSach');
    }

    // Create payment record
    await transaction.request()
      .input('MaDH', sql.Int, newOrder.MaDH)
      .input('PhuongThuc', sql.NVarChar, PhuongThucThanhToan)
      .input('SoTien', sql.Decimal(18, 2), TongTien)
      .query(`
        INSERT INTO THANHTOAN (MaDH, PhuongThuc, SoTien)
        VALUES (@MaDH, @PhuongThuc, @SoTien)
      `);

    await transaction.commit();

    // Get complete order info
    const completeOrder = await getOrderByIdInternal(newOrder.MaDH);

    res.status(201).json({
      status: 'success',
      message: 'Tạo đơn hàng thành công',
      data: {
        order: completeOrder
      }
    });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TrangThaiDon } = req.body;
    const pool = await poolPromise;

    // Check if order exists
    const existingOrder = await pool.request()
      .input('MaDH', sql.Int, id)
      .query('SELECT MaDH, TrangThaiDon FROM DONHANG WHERE MaDH = @MaDH');

    if (existingOrder.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const result = await pool.request()
      .input('MaDH', sql.Int, id)
      .input('TrangThaiDon', sql.NVarChar, TrangThaiDon)
      .input('MaNhanVien', sql.Int, req.user.id)
      .query(`
        UPDATE DONHANG 
        SET TrangThaiDon = @TrangThaiDon, MaNhanVien = @MaNhanVien
        OUTPUT INSERTED.*
        WHERE MaDH = @MaDH
      `);

    const updatedOrder = result.recordset[0];

    // If order is cancelled, restore book quantities
    if (TrangThaiDon === 'Huy') {
      const itemsResult = await pool.request()
        .input('MaDH', sql.Int, id)
        .query('SELECT MaSach, SoLuong FROM CTDONHANG WHERE MaDH = @MaDH');

      for (const item of itemsResult.recordset) {
        await pool.request()
          .input('MaSach', sql.Int, item.MaSach)
          .input('SoLuong', sql.Int, item.SoLuong)
          .query('UPDATE SACH SET SoLuongTon = SoLuongTon + @SoLuong WHERE MaSach = @MaSach');
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: {
        order: updatedOrder
      }
    });

  } catch (error) {
    next(error);
  }
};

const getOrderByIdInternal = async (orderId) => {
  const pool = await poolPromise;
  
  const orderResult = await pool.request()
    .input('MaDH', sql.Int, orderId)
    .query(`
      SELECT 
        d.*,
        k.HoTen as TenKhachHang,
        k.Email as EmailKhachHang,
        k.SoDienThoai,
        k.DiaChi,
        n.HoTen as TenNhanVien
      FROM DONHANG d
      LEFT JOIN KHACHHANG k ON d.MaKH = k.MaKH
      LEFT JOIN NHANVIEN n ON d.MaNhanVien = n.MaNhanVien
      WHERE d.MaDH = @MaDH
    `);

  const itemsResult = await pool.request()
    .input('MaDH', sql.Int, orderId)
    .query(`
      SELECT 
        c.MaSach,
        c.SoLuong,
        c.DonGia,
        c.ThanhTien,
        s.TenSach,
        s.TacGia,
        s.AnhBia
      FROM CTDONHANG c
      INNER JOIN SACH s ON c.MaSach = s.MaSach
      WHERE c.MaDH = @MaDH
    `);

  const order = orderResult.recordset[0];
  order.items = itemsResult.recordset;

  return order;
};

const getCustomerOrders = async (req, res, next) => {
  try {
    const { id } = req.user; // Customer ID from auth middleware
    const { page = 1, limit = 10, status = '' } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    let whereCondition = 'WHERE d.MaKH = @MaKH';
    let request = pool.request().input('MaKH', sql.Int, id);

    if (status) {
      whereCondition += ' AND d.TrangThaiDon = @status';
      request = request.input('status', sql.NVarChar, status);
    }

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM DONHANG d ${whereCondition}
    `);
    const total = countResult.recordset[0].total;

    // Get orders with pagination
    const result = await request
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT 
          d.MaDH,
          d.NgayDat,
          d.TongTien,
          d.TrangThaiDon,
          d.GhiChu,
          (SELECT COUNT(*) FROM CTDONHANG WHERE MaDH = d.MaDH) as SoLuongSanPham,
          t.TrangThai as TrangThaiThanhToan
        FROM DONHANG d
        LEFT JOIN THANHTOAN t ON d.MaDH = t.MaDH
        ${whereCondition}
        ORDER BY d.NgayDat DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        orders: result.recordset,
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

const getOrderStats = async (req, res, next) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as TongDonHang,
        SUM(CASE WHEN TrangThaiDon = 'ChoXacNhan' THEN 1 ELSE 0 END) as DonChoXacNhan,
        SUM(CASE WHEN TrangThaiDon = 'DangXuLy' THEN 1 ELSE 0 END) as DonDangXuLy,
        SUM(CASE WHEN TrangThaiDon = 'DangGiao' THEN 1 ELSE 0 END) as DonDangGiao,
        SUM(CASE WHEN TrangThaiDon = 'HoanThanh' THEN 1 ELSE 0 END) as DonHoanThanh,
        SUM(CASE WHEN TrangThaiDon = 'Huy' THEN 1 ELSE 0 END) as DonHuy,
        SUM(TongTien) as TongDoanhThu,
        AVG(TongTien) as DonGiaTrungBinh
      FROM DONHANG
      WHERE TrangThaiDon = 'HoanThanh'
    `);

    // Get daily revenue for last 7 days
    const revenueResult = await pool.request().query(`
      SELECT 
        CONVERT(DATE, NgayDat) as Ngay,
        COUNT(*) as SoDon,
        SUM(TongTien) as DoanhThu
      FROM DONHANG
      WHERE TrangThaiDon = 'HoanThanh' 
        AND NgayDat >= DATEADD(DAY, -7, GETDATE())
      GROUP BY CONVERT(DATE, NgayDat)
      ORDER BY Ngay DESC
    `);

    res.status(200).json({
      status: 'success',
      data: {
        stats: result.recordset[0],
        revenueTrend: revenueResult.recordset
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getCustomerOrders,
  getOrderStats
};