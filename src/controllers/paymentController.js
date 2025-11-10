const { poolPromise, sql } = require('../config/database');

const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaDH', sql.Int, orderId)
      .query(`
        SELECT 
          t.*,
          d.TongTien,
          d.TrangThaiDon,
          k.HoTen as TenKhachHang,
          k.Email
        FROM THANHTOAN t
        INNER JOIN DONHANG d ON t.MaDH = d.MaDH
        INNER JOIN KHACHHANG k ON d.MaKH = k.MaKH
        WHERE t.MaDH = @MaDH
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy thông tin thanh toán'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment: result.recordset[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { TrangThai } = req.body;
    const pool = await poolPromise;

    // Check if payment exists
    const existingPayment = await pool.request()
      .input('MaDH', sql.Int, orderId)
      .query('SELECT MaThanhToan FROM THANHTOAN WHERE MaDH = @MaDH');

    if (existingPayment.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy thông tin thanh toán'
      });
    }

    const result = await pool.request()
      .input('MaDH', sql.Int, orderId)
      .input('TrangThai', sql.NVarChar, TrangThai)
      .input('NgayThanhToan', sql.DateTime, TrangThai === 'ThanhCong' ? new Date() : null)
      .query(`
        UPDATE THANHTOAN 
        SET TrangThai = @TrangThai, 
            NgayThanhToan = CASE WHEN @TrangThai = 'ThanhCong' THEN @NgayThanhToan ELSE NgayThanhToan END
        OUTPUT INSERTED.*
        WHERE MaDH = @MaDH
      `);

    const updatedPayment = result.recordset[0];

    // If payment is successful, update order status to processing
    if (TrangThai === 'ThanhCong') {
      await pool.request()
        .input('MaDH', sql.Int, orderId)
        .input('TrangThaiDon', sql.NVarChar, 'DangXuLy')
        .query('UPDATE DONHANG SET TrangThaiDon = @TrangThaiDon WHERE MaDH = @MaDH');
    }

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: {
        payment: updatedPayment
      }
    });

  } catch (error) {
    next(error);
  }
};

const getPaymentStats = async (req, res, next) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as TongSoGiaoDich,
        SUM(CASE WHEN TrangThai = 'ThanhCong' THEN 1 ELSE 0 END) as GiaoDichThanhCong,
        SUM(CASE WHEN TrangThai = 'ThatBai' THEN 1 ELSE 0 END) as GiaoDichThatBai,
        SUM(CASE WHEN TrangThai = 'ChoXuLy' THEN 1 ELSE 0 END) as GiaoDichChoXuLy,
        SUM(CASE WHEN TrangThai = 'ThanhCong' THEN SoTien ELSE 0 END) as TongTienThanhCong,
        AVG(CASE WHEN TrangThai = 'ThanhCong' THEN SoTien ELSE NULL END) as SoTienTrungBinh
      FROM THANHTOAN
    `);

    // Get payment method distribution
    const methodResult = await pool.request().query(`
      SELECT 
        PhuongThuc,
        COUNT(*) as SoLuong,
        SUM(SoTien) as TongTien
      FROM THANHTOAN
      WHERE TrangThai = 'ThanhCong'
      GROUP BY PhuongThuc
      ORDER BY SoLuong DESC
    `);

    res.status(200).json({
      status: 'success',
      data: {
        stats: result.recordset[0],
        paymentMethods: methodResult.recordset
      }
    });

  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { PhuongThuc, SoTien } = req.body;
    const pool = await poolPromise;

    // Check if order exists
    const orderResult = await pool.request()
      .input('MaDH', sql.Int, orderId)
      .query('SELECT TongTien, TrangThaiDon FROM DONHANG WHERE MaDH = @MaDH');

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const order = orderResult.recordset[0];

    // Check if payment already exists
    const existingPayment = await pool.request()
      .input('MaDH', sql.Int, orderId)
      .query('SELECT MaThanhToan FROM THANHTOAN WHERE MaDH = @MaDH');

    if (existingPayment.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Đơn hàng đã có thông tin thanh toán'
      });
    }

    const result = await pool.request()
      .input('MaDH', sql.Int, orderId)
      .input('PhuongThuc', sql.NVarChar, PhuongThuc)
      .input('SoTien', sql.Decimal(18, 2), SoTien || order.TongTien)
      .query(`
        INSERT INTO THANHTOAN (MaDH, PhuongThuc, SoTien)
        OUTPUT INSERTED.*
        VALUES (@MaDH, @PhuongThuc, @SoTien)
      `);

    const newPayment = result.recordset[0];

    res.status(201).json({
      status: 'success',
      message: 'Tạo thông tin thanh toán thành công',
      data: {
        payment: newPayment
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentByOrderId,
  updatePaymentStatus,
  getPaymentStats,
  createPayment
};