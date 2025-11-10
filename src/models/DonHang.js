const { poolPromise, sql } = require('../config/database');

class DonHang {
  // Lấy tất cả đơn hàng
  static async getAll(options = {}) {
    try {
      const { page = 1, limit = 10, status = '', fromDate = '', toDate = '' } = options;
      const offset = (page - 1) * limit;
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

      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        request = request.input(key, sql.NVarChar, inputParams[key]);
      });

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

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng theo ID
  static async getById(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
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
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo đơn hàng mới
  static async create(donHangData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, donHangData.MaKH)
        .input('MaNhanVien', sql.Int, donHangData.MaNhanVien)
        .input('TongTien', sql.Decimal(18, 2), donHangData.TongTien)
        .input('TrangThaiDon', sql.NVarChar(50), donHangData.TrangThaiDon || 'ChoXacNhan')
        .input('GhiChu', sql.NVarChar(500), donHangData.GhiChu)
        .query(`
          INSERT INTO DONHANG (MaKH, MaNhanVien, TongTien, TrangThaiDon, GhiChu)
          OUTPUT INSERTED.*
          VALUES (@MaKH, @MaNhanVien, @TongTien, @TrangThaiDon, @GhiChu)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái đơn hàng
  static async updateStatus(MaDH, TrangThaiDon, MaNhanVien = null) {
    try {
      const pool = await poolPromise;
      
      let query = '';
      let request = pool.request()
        .input('MaDH', sql.Int, MaDH)
        .input('TrangThaiDon', sql.NVarChar(50), TrangThaiDon);

      if (MaNhanVien) {
        query = `
          UPDATE DONHANG 
          SET TrangThaiDon = @TrangThaiDon, MaNhanVien = @MaNhanVien
          OUTPUT INSERTED.*
          WHERE MaDH = @MaDH
        `;
        request = request.input('MaNhanVien', sql.Int, MaNhanVien);
      } else {
        query = `
          UPDATE DONHANG 
          SET TrangThaiDon = @TrangThaiDon
          OUTPUT INSERTED.*
          WHERE MaDH = @MaDH
        `;
      }

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin đơn hàng
  static async update(MaDH, donHangData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .input('TongTien', sql.Decimal(18, 2), donHangData.TongTien)
        .input('GhiChu', sql.NVarChar(500), donHangData.GhiChu)
        .input('MaNhanVien', sql.Int, donHangData.MaNhanVien)
        .query(`
          UPDATE DONHANG 
          SET TongTien = @TongTien, GhiChu = @GhiChu, MaNhanVien = @MaNhanVien
          OUTPUT INSERTED.*
          WHERE MaDH = @MaDH
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng của khách hàng
  static async getByCustomer(MaKH, options = {}) {
    try {
      const { page = 1, limit = 10, status = '' } = options;
      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      let whereCondition = 'WHERE d.MaKH = @MaKH';
      let request = pool.request().input('MaKH', sql.Int, MaKH);

      if (status) {
        whereCondition += ' AND d.TrangThaiDon = @status';
        request = request.input('status', sql.NVarChar, status);
      }

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

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết đơn hàng (bao gồm items)
  static async getOrderDetails(MaDH) {
    try {
      const pool = await poolPromise;
      
      // Get order basic info
      const orderResult = await pool.request()
        .input('MaDH', sql.Int, MaDH)
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
        return null;
      }

      // Get order items
      const itemsResult = await pool.request()
        .input('MaDH', sql.Int, MaDH)
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
        .input('MaDH', sql.Int, MaDH)
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

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê đơn hàng
  static async getStats() {
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
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy doanh thu theo ngày (7 ngày gần nhất)
  static async getRevenueTrend(days = 7) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('days', sql.Int, days)
        .query(`
          SELECT 
            CONVERT(DATE, NgayDat) as Ngay,
            COUNT(*) as SoDon,
            SUM(TongTien) as DoanhThu
          FROM DONHANG
          WHERE TrangThaiDon = 'HoanThanh' 
            AND NgayDat >= DATEADD(DAY, -@days, GETDATE())
          GROUP BY CONVERT(DATE, NgayDat)
          ORDER BY Ngay DESC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra đơn hàng có tồn tại
  static async exists(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .query('SELECT COUNT(*) as count FROM DONHANG WHERE MaDH = @MaDH');
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tổng số đơn hàng cho phân trang
  static async getCount(options = {}) {
    try {
      const { status = '', fromDate = '', toDate = '' } = options;
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

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        request = request.input(key, sql.NVarChar, inputParams[key]);
      });

      const result = await request.query(`
        SELECT COUNT(*) as total FROM DONHANG ${whereClause}
      `);

      return result.recordset[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DonHang;