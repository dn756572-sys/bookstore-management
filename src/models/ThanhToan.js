const { poolPromise, sql } = require('../config/database');

class ThanhToan {
  // Lấy thông tin thanh toán theo MaDH
  static async getByOrderId(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
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
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo thông tin thanh toán
  static async create(thanhToanData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, thanhToanData.MaDH)
        .input('PhuongThuc', sql.NVarChar(100), thanhToanData.PhuongThuc)
        .input('SoTien', sql.Decimal(18, 2), thanhToanData.SoTien)
        .input('TrangThai', sql.NVarChar(50), thanhToanData.TrangThai || 'ChoXuLy')
        .query(`
          INSERT INTO THANHTOAN (MaDH, PhuongThuc, SoTien, TrangThai)
          OUTPUT INSERTED.*
          VALUES (@MaDH, @PhuongThuc, @SoTien, @TrangThai)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái thanh toán
  static async updateStatus(MaThanhToan, TrangThai) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaThanhToan', sql.Int, MaThanhToan)
        .input('TrangThai', sql.NVarChar(50), TrangThai)
        .input('NgayThanhToan', sql.DateTime, TrangThai === 'ThanhCong' ? new Date() : null)
        .query(`
          UPDATE THANHTOAN 
          SET TrangThai = @TrangThai, 
              NgayThanhToan = CASE WHEN @TrangThai = 'ThanhCong' THEN @NgayThanhToan ELSE NgayThanhToan END
          OUTPUT INSERTED.*
          WHERE MaThanhToan = @MaThanhToan
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái thanh toán theo MaDH
  static async updateStatusByOrder(MaDH, TrangThai) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .input('TrangThai', sql.NVarChar(50), TrangThai)
        .input('NgayThanhToan', sql.DateTime, TrangThai === 'ThanhCong' ? new Date() : null)
        .query(`
          UPDATE THANHTOAN 
          SET TrangThai = @TrangThai, 
              NgayThanhToan = CASE WHEN @TrangThai = 'ThanhCong' THEN @NgayThanhToan ELSE NgayThanhToan END
          OUTPUT INSERTED.*
          WHERE MaDH = @MaDH
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê thanh toán
  static async getStats() {
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
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy phân phối phương thức thanh toán
  static async getPaymentMethodDistribution() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          PhuongThuc,
          COUNT(*) as SoLuong,
          SUM(SoTien) as TongTien
        FROM THANHTOAN
        WHERE TrangThai = 'ThanhCong'
        GROUP BY PhuongThuc
        ORDER BY SoLuong DESC
      `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra thanh toán đã tồn tại cho đơn hàng
  static async existsForOrder(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .query('SELECT COUNT(*) as count FROM THANHTOAN WHERE MaDH = @MaDH');
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch sử thanh toán của khách hàng
  static async getByCustomer(MaKH, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT 
            t.MaThanhToan,
            t.PhuongThuc,
            t.SoTien,
            t.TrangThai,
            t.NgayThanhToan,
            d.MaDH,
            d.NgayDat,
            d.TrangThaiDon
          FROM THANHTOAN t
          INNER JOIN DONHANG d ON t.MaDH = d.MaDH
          WHERE d.MaKH = @MaKH
          ORDER BY t.NgayThanhToan DESC
          OFFSET @offset ROWS 
          FETCH NEXT @limit ROWS ONLY
        `);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy doanh thu theo ngày từ thanh toán
  static async getRevenueByDate(fromDate, toDate) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('fromDate', sql.Date, fromDate)
        .input('toDate', sql.Date, toDate)
        .query(`
          SELECT 
            CONVERT(DATE, NgayThanhToan) as Ngay,
            COUNT(*) as SoGiaoDich,
            SUM(SoTien) as DoanhThu
          FROM THANHTOAN
          WHERE TrangThai = 'ThanhCong' 
            AND NgayThanhToan BETWEEN @fromDate AND @toDate
          GROUP BY CONVERT(DATE, NgayThanhToan)
          ORDER BY Ngay DESC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ThanhToan;