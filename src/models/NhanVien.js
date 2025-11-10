const { poolPromise, sql } = require('../config/database');
const { hashPassword } = require('../utils/helpers');

class NhanVien {
  // Lấy tất cả nhân viên
  static async getAll(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = options;
      const offset = (page - 1) * limit;
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

      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        request = request.input(key, sql.NVarChar, inputParams[key]);
      });

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

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy nhân viên theo ID
  static async getById(MaNhanVien) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaNhanVien', sql.Int, MaNhanVien)
        .query('SELECT MaNhanVien, TenDangNhap, HoTen, VaiTro FROM NHANVIEN WHERE MaNhanVien = @MaNhanVien');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy nhân viên theo tên đăng nhập
  static async getByUsername(TenDangNhap) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenDangNhap', sql.NVarChar, TenDangNhap)
        .query('SELECT * FROM NHANVIEN WHERE TenDangNhap = @TenDangNhap');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo nhân viên mới
  static async create(nhanVienData) {
    try {
      const pool = await poolPromise;
      
      // Hash password
      const hashedPassword = await hashPassword(nhanVienData.MatKhau);

      const result = await pool.request()
        .input('TenDangNhap', sql.NVarChar(100), nhanVienData.TenDangNhap)
        .input('MatKhau', sql.NVarChar(255), hashedPassword)
        .input('HoTen', sql.NVarChar(255), nhanVienData.HoTen)
        .input('VaiTro', sql.NVarChar(50), nhanVienData.VaiTro || 'NhanVien')
        .query(`
          INSERT INTO NHANVIEN (TenDangNhap, MatKhau, HoTen, VaiTro)
          OUTPUT INSERTED.MaNhanVien, INSERTED.TenDangNhap, INSERTED.HoTen, INSERTED.VaiTro
          VALUES (@TenDangNhap, @MatKhau, @HoTen, @VaiTro)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật nhân viên
  static async update(MaNhanVien, nhanVienData) {
    try {
      const pool = await poolPromise;
      
      let query = '';
      let request = pool.request()
        .input('MaNhanVien', sql.Int, MaNhanVien)
        .input('TenDangNhap', sql.NVarChar(100), nhanVienData.TenDangNhap)
        .input('HoTen', sql.NVarChar(255), nhanVienData.HoTen)
        .input('VaiTro', sql.NVarChar(50), nhanVienData.VaiTro);

      if (nhanVienData.MatKhau) {
        const hashedPassword = await hashPassword(nhanVienData.MatKhau);
        query = `
          UPDATE NHANVIEN 
          SET TenDangNhap = @TenDangNhap, HoTen = @HoTen, VaiTro = @VaiTro, MatKhau = @MatKhau
          OUTPUT INSERTED.MaNhanVien, INSERTED.TenDangNhap, INSERTED.HoTen, INSERTED.VaiTro
          WHERE MaNhanVien = @MaNhanVien
        `;
        request = request.input('MatKhau', sql.NVarChar(255), hashedPassword);
      } else {
        query = `
          UPDATE NHANVIEN 
          SET TenDangNhap = @TenDangNhap, HoTen = @HoTen, VaiTro = @VaiTro
          OUTPUT INSERTED.MaNhanVien, INSERTED.TenDangNhap, INSERTED.HoTen, INSERTED.VaiTro
          WHERE MaNhanVien = @MaNhanVien
        `;
      }

      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa nhân viên
  static async delete(MaNhanVien) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaNhanVien', sql.Int, MaNhanVien)
        .query('DELETE FROM NHANVIEN WHERE MaNhanVien = @MaNhanVien');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra tên đăng nhập đã tồn tại
  static async usernameExists(TenDangNhap, excludeMaNhanVien = null) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT COUNT(*) as count FROM NHANVIEN WHERE TenDangNhap = @TenDangNhap';
      let request = pool.request().input('TenDangNhap', sql.NVarChar, TenDangNhap);

      if (excludeMaNhanVien) {
        query += ' AND MaNhanVien != @MaNhanVien';
        request = request.input('MaNhanVien', sql.Int, excludeMaNhanVien);
      }

      const result = await request.query(query);
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê nhân viên
  static async getStats() {
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
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy top nhân viên xử lý đơn hàng
  static async getTopEmployees(limit = 5) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
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
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra nhân viên có xử lý đơn hàng không
  static async hasProcessedOrders(MaNhanVien) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaNhanVien', sql.Int, MaNhanVien)
        .query('SELECT COUNT(*) as count FROM DONHANG WHERE MaNhanVien = @MaNhanVien');
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật mật khẩu
  static async updatePassword(MaNhanVien, newPassword) {
    try {
      const pool = await poolPromise;
      const hashedPassword = await hashPassword(newPassword);
      
      const result = await pool.request()
        .input('MaNhanVien', sql.Int, MaNhanVien)
        .input('MatKhau', sql.NVarChar(255), hashedPassword)
        .query('UPDATE NHANVIEN SET MatKhau = @MatKhau WHERE MaNhanVien = @MaNhanVien');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NhanVien;