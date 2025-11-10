const { poolPromise, sql } = require('../config/database');

class CTDonHang {
  // Lấy chi tiết đơn hàng theo MaDH
  static async getByOrderId(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .query(`
          SELECT 
            c.MaSach,
            c.SoLuong,
            c.DonGia,
            c.ThanhTien,
            s.TenSach,
            s.TacGia,
            s.AnhBia,
            s.MaDanMuc,
            d.TenDanMuc
          FROM CTDONHANG c
          INNER JOIN SACH s ON c.MaSach = s.MaSach
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
          WHERE c.MaDH = @MaDH
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Thêm chi tiết đơn hàng
  static async create(chiTietData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, chiTietData.MaDH)
        .input('MaSach', sql.Int, chiTietData.MaSach)
        .input('SoLuong', sql.Int, chiTietData.SoLuong)
        .input('DonGia', sql.Decimal(18, 2), chiTietData.DonGia)
        .input('ThanhTien', sql.Decimal(18, 2), chiTietData.ThanhTien)
        .query(`
          INSERT INTO CTDONHANG (MaDH, MaSach, SoLuong, DonGia, ThanhTien)
          OUTPUT INSERTED.*
          VALUES (@MaDH, @MaSach, @SoLuong, @DonGia, @ThanhTien)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Thêm nhiều chi tiết đơn hàng cùng lúc
  static async createMultiple(MaDH, items) {
    try {
      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      
      await transaction.begin();

      try {
        for (const item of items) {
          await transaction.request()
            .input('MaDH', sql.Int, MaDH)
            .input('MaSach', sql.Int, item.MaSach)
            .input('SoLuong', sql.Int, item.SoLuong)
            .input('DonGia', sql.Decimal(18, 2), item.DonGia)
            .input('ThanhTien', sql.Decimal(18, 2), item.ThanhTien)
            .query(`
              INSERT INTO CTDONHANG (MaDH, MaSach, SoLuong, DonGia, ThanhTien)
              VALUES (@MaDH, @MaSach, @SoLuong, @DonGia, @ThanhTien)
            `);
        }

        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật chi tiết đơn hàng
  static async update(MaDH, MaSach, chiTietData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .input('MaSach', sql.Int, MaSach)
        .input('SoLuong', sql.Int, chiTietData.SoLuong)
        .input('DonGia', sql.Decimal(18, 2), chiTietData.DonGia)
        .input('ThanhTien', sql.Decimal(18, 2), chiTietData.ThanhTien)
        .query(`
          UPDATE CTDONHANG 
          SET SoLuong = @SoLuong, DonGia = @DonGia, ThanhTien = @ThanhTien
          OUTPUT INSERTED.*
          WHERE MaDH = @MaDH AND MaSach = @MaSach
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa chi tiết đơn hàng
  static async delete(MaDH, MaSach) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .input('MaSach', sql.Int, MaSach)
        .query('DELETE FROM CTDONHANG WHERE MaDH = @MaDH AND MaSach = @MaSach');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa tất cả chi tiết đơn hàng
  static async deleteByOrder(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .query('DELETE FROM CTDONHANG WHERE MaDH = @MaDH');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Tính tổng tiền của đơn hàng
  static async calculateOrderTotal(MaDH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .query('SELECT SUM(ThanhTien) as TongTien FROM CTDONHANG WHERE MaDH = @MaDH');
      return result.recordset[0].TongTien || 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra sách đã tồn tại trong đơn hàng
  static async exists(MaDH, MaSach) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDH', sql.Int, MaDH)
        .input('MaSach', sql.Int, MaSach)
        .query('SELECT COUNT(*) as count FROM CTDONHANG WHERE MaDH = @MaDH AND MaSach = @MaSach');
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê sách bán chạy
  static async getBestSellingBooks(limit = 10, fromDate = null, toDate = null) {
    try {
      const pool = await poolPromise;
      
      let whereCondition = 'WHERE dh.TrangThaiDon = \'HoanThanh\'';
      let request = pool.request();

      if (fromDate) {
        whereCondition += ' AND dh.NgayDat >= @fromDate';
        request = request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        whereCondition += ' AND dh.NgayDat <= @toDate';
        request = request.input('toDate', sql.Date, toDate);
      }

      const result = await request
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            s.MaSach,
            s.TenSach,
            s.TacGia,
            s.GiaBan,
            s.AnhBia,
            d.TenDanMuc,
            SUM(ct.SoLuong) as TongSoLuongBan,
            SUM(ct.ThanhTien) as TongDoanhThu
          FROM CTDONHANG ct
          INNER JOIN DONHANG dh ON ct.MaDH = dh.MaDH
          INNER JOIN SACH s ON ct.MaSach = s.MaSach
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
          ${whereCondition}
          GROUP BY s.MaSach, s.TenSach, s.TacGia, s.GiaBan, s.AnhBia, d.TenDanMuc
          ORDER BY TongSoLuongBan DESC
        `);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy số lượng sách đã bán
  static async getBookSales(MaSach, fromDate = null, toDate = null) {
    try {
      const pool = await poolPromise;
      
      let whereCondition = 'WHERE ct.MaSach = @MaSach AND dh.TrangThaiDon = \'HoanThanh\'';
      let request = pool.request().input('MaSach', sql.Int, MaSach);

      if (fromDate) {
        whereCondition += ' AND dh.NgayDat >= @fromDate';
        request = request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        whereCondition += ' AND dh.NgayDat <= @toDate';
        request = request.input('toDate', sql.Date, toDate);
      }

      const result = await request.query(`
        SELECT 
          SUM(ct.SoLuong) as TongSoLuongBan,
          SUM(ct.ThanhTien) as TongDoanhThu,
          COUNT(DISTINCT dh.MaDH) as SoDonHang
        FROM CTDONHANG ct
        INNER JOIN DONHANG dh ON ct.MaDH = dh.MaDH
        ${whereCondition}
      `);

      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CTDonHang;