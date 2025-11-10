const { poolPromise, sql } = require('../config/database');

class DanhMucSach {
  // Lấy tất cả danh mục
  static async getAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT *, 
          (SELECT COUNT(*) FROM SACH WHERE MaDanMuc = DANHMUCSACH.MaDanMuc) as SoLuongSach
        FROM DANHMUCSACH 
        ORDER BY TenDanMuc
      `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh mục theo ID
  static async getById(MaDanMuc) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDanMuc', sql.Int, MaDanMuc)
        .query(`
          SELECT *, 
            (SELECT COUNT(*) FROM SACH WHERE MaDanMuc = @MaDanMuc) as SoLuongSach
          FROM DANHMUCSACH 
          WHERE MaDanMuc = @MaDanMuc
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo danh mục mới
  static async create(danhMucData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenDanMuc', sql.NVarChar(255), danhMucData.TenDanMuc)
        .input('MoTa', sql.NVarChar(500), danhMucData.MoTa)
        .query(`
          INSERT INTO DANHMUCSACH (TenDanMuc, MoTa)
          OUTPUT INSERTED.*
          VALUES (@TenDanMuc, @MoTa)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật danh mục
  static async update(MaDanMuc, danhMucData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDanMuc', sql.Int, MaDanMuc)
        .input('TenDanMuc', sql.NVarChar(255), danhMucData.TenDanMuc)
        .input('MoTa', sql.NVarChar(500), danhMucData.MoTa)
        .query(`
          UPDATE DANHMUCSACH 
          SET TenDanMuc = @TenDanMuc, MoTa = @MoTa
          OUTPUT INSERTED.*
          WHERE MaDanMuc = @MaDanMuc
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa danh mục
  static async delete(MaDanMuc) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDanMuc', sql.Int, MaDanMuc)
        .query('DELETE FROM DANHMUCSACH WHERE MaDanMuc = @MaDanMuc');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra danh mục có sách không
  static async hasBooks(MaDanMuc) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaDanMuc', sql.Int, MaDanMuc)
        .query('SELECT COUNT(*) as count FROM SACH WHERE MaDanMuc = @MaDanMuc');
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê danh mục
  static async getStats() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          d.MaDanMuc,
          d.TenDanMuc,
          COUNT(s.MaSach) as TongSoSach,
          SUM(s.SoLuongTon) as TongSoLuongTon,
          AVG(s.GiaBan) as GiaTrungBinh,
          SUM(s.GiaBan * s.SoLuongTon) as TongGiaTriTonKho
        FROM DANHMUCSACH d
        LEFT JOIN SACH s ON d.MaDanMuc = s.MaDanMuc
        GROUP BY d.MaDanMuc, d.TenDanMuc
        ORDER BY TongSoSach DESC
      `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DanhMucSach;