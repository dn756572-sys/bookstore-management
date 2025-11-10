const { poolPromise, sql } = require('../config/database');

class GioHang {
  // Lấy giỏ hàng của khách hàng
  static async getByCustomer(MaKH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .query(`
          SELECT 
            g.MaGH,
            g.MaSach,
            g.SoLuong,
            g.ThanhTien,
            s.TenSach,
            s.TacGia,
            s.GiaBan,
            s.SoLuongTon,
            s.AnhBia,
            s.MaDanMuc,
            d.TenDanMuc
          FROM GIOHANG g
          INNER JOIN SACH s ON g.MaSach = s.MaSach
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
          WHERE g.MaKH = @MaKH
          ORDER BY g.MaGH DESC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Thêm sách vào giỏ hàng
  static async addItem(gioHangData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, gioHangData.MaKH)
        .input('MaSach', sql.Int, gioHangData.MaSach)
        .input('SoLuong', sql.Int, gioHangData.SoLuong)
        .input('ThanhTien', sql.Decimal(18, 2), gioHangData.ThanhTien)
        .query(`
          INSERT INTO GIOHANG (MaKH, MaSach, SoLuong, ThanhTien)
          OUTPUT INSERTED.*
          VALUES (@MaKH, @MaSach, @SoLuong, @ThanhTien)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật số lượng sách trong giỏ hàng
  static async updateQuantity(MaGH, SoLuong, ThanhTien) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaGH', sql.Int, MaGH)
        .input('SoLuong', sql.Int, SoLuong)
        .input('ThanhTien', sql.Decimal(18, 2), ThanhTien)
        .query(`
          UPDATE GIOHANG 
          SET SoLuong = @SoLuong, ThanhTien = @ThanhTien
          OUTPUT INSERTED.*
          WHERE MaGH = @MaGH
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa sách khỏi giỏ hàng
  static async removeItem(MaGH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaGH', sql.Int, MaGH)
        .query('DELETE FROM GIOHANG WHERE MaGH = @MaGH');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa toàn bộ giỏ hàng của khách hàng
  static async clearCart(MaKH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .query('DELETE FROM GIOHANG WHERE MaKH = @MaKH');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra sách đã có trong giỏ hàng
  static async itemExists(MaKH, MaSach) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .input('MaSach', sql.Int, MaSach)
        .query('SELECT MaGH, SoLuong FROM GIOHANG WHERE MaKH = @MaKH AND MaSach = @MaSach');
      return result.recordset[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tổng số lượng sách trong giỏ hàng
  static async getTotalItems(MaKH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .query('SELECT COUNT(*) as count, SUM(SoLuong) as totalItems FROM GIOHANG WHERE MaKH = @MaKH');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy tổng tiền giỏ hàng
  static async getTotalAmount(MaKH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .query('SELECT SUM(ThanhTien) as total FROM GIOHANG WHERE MaKH = @MaKH');
      return result.recordset[0].total || 0;
    } catch (error) {
      throw error;
    }
  }

  // Chuyển giỏ hàng thành đơn hàng (xóa giỏ hàng sau khi tạo đơn)
  static async convertToOrder(MaKH, MaDH) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();

      // Lấy tất cả items trong giỏ hàng
      const cartItems = await transaction.request()
        .input('MaKH', sql.Int, MaKH)
        .query('SELECT * FROM GIOHANG WHERE MaKH = @MaKH');

      if (cartItems.recordset.length === 0) {
        throw new Error('Giỏ hàng trống');
      }

      // Thêm vào chi tiết đơn hàng
      for (const item of cartItems.recordset) {
        await transaction.request()
          .input('MaDH', sql.Int, MaDH)
          .input('MaSach', sql.Int, item.MaSach)
          .input('SoLuong', sql.Int, item.SoLuong)
          .input('DonGia', sql.Decimal(18, 2), item.ThanhTien / item.SoLuong) // Tính đơn giá
          .input('ThanhTien', sql.Decimal(18, 2), item.ThanhTien)
          .query(`
            INSERT INTO CTDONHANG (MaDH, MaSach, SoLuong, DonGia, ThanhTien)
            VALUES (@MaDH, @MaSach, @SoLuong, @DonGia, @ThanhTien)
          `);
      }

      // Xóa giỏ hàng
      await transaction.request()
        .input('MaKH', sql.Int, MaKH)
        .query('DELETE FROM GIOHANG WHERE MaKH = @MaKH');

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Kiểm tra tồn kho cho tất cả sách trong giỏ hàng
  static async validateStock(MaKH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .query(`
          SELECT 
            g.MaGH,
            g.MaSach,
            g.SoLuong,
            s.TenSach,
            s.SoLuongTon,
            CASE 
              WHEN s.SoLuongTon >= g.SoLuong THEN 1
              ELSE 0
            END as DuSoLuong
          FROM GIOHANG g
          INNER JOIN SACH s ON g.MaSach = s.MaSach
          WHERE g.MaKH = @MaKH
        `);

      const validItems = result.recordset.filter(item => item.DuSoLuong === 1);
      const invalidItems = result.recordset.filter(item => item.DuSoLuong === 0);

      return {
        isValid: invalidItems.length === 0,
        validItems,
        invalidItems
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = GioHang;