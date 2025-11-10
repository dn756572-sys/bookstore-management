const { poolPromise, sql } = require('../config/database');
const { hashPassword } = require('../utils/helpers');

class KhachHang {
  // Lấy tất cả khách hàng
  static async getAll(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = options;
      const offset = (page - 1) * limit;
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

      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        if (key === 'status') {
          request = request.input(key, sql.Int, inputParams[key]);
        } else {
          request = request.input(key, sql.NVarChar, inputParams[key]);
        }
      });

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

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy khách hàng theo ID
  static async getById(MaKH) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .query(`
          SELECT 
            MaKH, HoTen, Email, SoDienThoai, DiaChi, 
            NgayDangKy, TrangThai
          FROM KHACHHANG 
          WHERE MaKH = @MaKH
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy khách hàng theo email
  static async getByEmail(Email) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Email', sql.NVarChar, Email)
        .query('SELECT * FROM KHACHHANG WHERE Email = @Email');
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo khách hàng mới
  static async create(khachHangData) {
    try {
      const pool = await poolPromise;
      
      // Hash password
      const hashedPassword = await hashPassword(khachHangData.MatKhau);

      const result = await pool.request()
        .input('HoTen', sql.NVarChar(255), khachHangData.HoTen)
        .input('Email', sql.NVarChar(255), khachHangData.Email)
        .input('MatKhau', sql.NVarChar(255), hashedPassword)
        .input('SoDienThoai', sql.NVarChar(20), khachHangData.SoDienThoai)
        .input('DiaChi', sql.NVarChar(500), khachHangData.DiaChi)
        .query(`
          INSERT INTO KHACHHANG (HoTen, Email, MatKhau, SoDienThoai, DiaChi)
          OUTPUT INSERTED.MaKH, INSERTED.HoTen, INSERTED.Email, INSERTED.SoDienThoai, INSERTED.DiaChi, INSERTED.NgayDangKy, INSERTED.TrangThai
          VALUES (@HoTen, @Email, @MatKhau, @SoDienThoai, @DiaChi)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật khách hàng
  static async update(MaKH, khachHangData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .input('HoTen', sql.NVarChar(255), khachHangData.HoTen)
        .input('Email', sql.NVarChar(255), khachHangData.Email)
        .input('SoDienThoai', sql.NVarChar(20), khachHangData.SoDienThoai)
        .input('DiaChi', sql.NVarChar(500), khachHangData.DiaChi)
        .input('TrangThai', sql.Bit, khachHangData.TrangThai)
        .query(`
          UPDATE KHACHHANG 
          SET HoTen = @HoTen, Email = @Email, SoDienThoai = @SoDienThoai, 
              DiaChi = @DiaChi, TrangThai = @TrangThai
          OUTPUT INSERTED.MaKH, INSERTED.HoTen, INSERTED.Email, INSERTED.SoDienThoai, 
                 INSERTED.DiaChi, INSERTED.NgayDangKy, INSERTED.TrangThai
          WHERE MaKH = @MaKH
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật mật khẩu
  static async updatePassword(MaKH, newPassword) {
    try {
      const pool = await poolPromise;
      const hashedPassword = await hashPassword(newPassword);
      
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .input('MatKhau', sql.NVarChar(255), hashedPassword)
        .query('UPDATE KHACHHANG SET MatKhau = @MatKhau WHERE MaKH = @MaKH');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái
  static async updateStatus(MaKH, TrangThai) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .input('TrangThai', sql.Bit, TrangThai)
        .query('UPDATE KHACHHANG SET TrangThai = @TrangThai WHERE MaKH = @MaKH');
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra email đã tồn tại
  static async emailExists(Email, excludeMaKH = null) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT COUNT(*) as count FROM KHACHHANG WHERE Email = @Email';
      let request = pool.request().input('Email', sql.NVarChar, Email);

      if (excludeMaKH) {
        query += ' AND MaKH != @MaKH';
        request = request.input('MaKH', sql.Int, excludeMaKH);
      }

      const result = await request.query(query);
      return result.recordset[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê khách hàng
  static async getStats() {
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
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy top khách hàng
  static async getTopCustomers(limit = 10) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
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
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy đơn hàng của khách hàng
  static async getOrders(MaKH, options = {}) {
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
}

module.exports = KhachHang;