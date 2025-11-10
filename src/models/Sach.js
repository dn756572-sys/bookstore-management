const { poolPromise, sql } = require('../config/database');

class Sach {
  // Lấy tất cả sách với phân trang và tìm kiếm
  static async getAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        category = '',
        minPrice = '',
        maxPrice = ''
      } = options;

      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      let whereConditions = ['s.SoLuongTon >= 0'];
      let inputParams = {};

      if (search) {
        whereConditions.push('(s.TenSach LIKE @search OR s.TacGia LIKE @search OR s.TheLoai LIKE @search)');
        inputParams.search = `%${search}%`;
      }

      if (category) {
        whereConditions.push('s.MaDanMuc = @category');
        inputParams.category = parseInt(category);
      }

      if (minPrice) {
        whereConditions.push('s.GiaBan >= @minPrice');
        inputParams.minPrice = parseFloat(minPrice);
      }

      if (maxPrice) {
        whereConditions.push('s.GiaBan <= @maxPrice');
        inputParams.maxPrice = parseFloat(maxPrice);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Build request
      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        if (key === 'category') {
          request = request.input(key, sql.Int, inputParams[key]);
        } else if (key === 'minPrice' || key === 'maxPrice') {
          request = request.input(key, sql.Decimal(18, 2), inputParams[key]);
        } else {
          request = request.input(key, sql.NVarChar, inputParams[key]);
        }
      });

      const result = await request
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT 
            s.MaSach, s.TenSach, s.TacGia, s.TheLoai, s.MoTa,
            s.GiaBan, s.SoLuongTon, s.AnhBia, s.MaDanMuc,
            d.TenDanMuc,
            CASE 
              WHEN s.SoLuongTon > 10 THEN 'Còn hàng'
              WHEN s.SoLuongTon > 0 THEN 'Sắp hết'
              ELSE 'Hết hàng'
            END as TrangThaiKho
          FROM SACH s 
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
          ${whereClause}
          ORDER BY s.MaSach DESC
          OFFSET @offset ROWS 
          FETCH NEXT @limit ROWS ONLY
        `);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tổng số sách cho phân trang
  static async getCount(options = {}) {
    try {
      const { search = '', category = '', minPrice = '', maxPrice = '' } = options;
      const pool = await poolPromise;

      let whereConditions = ['1=1'];
      let inputParams = {};

      if (search) {
        whereConditions.push('(TenSach LIKE @search OR TacGia LIKE @search OR TheLoai LIKE @search)');
        inputParams.search = `%${search}%`;
      }

      if (category) {
        whereConditions.push('MaDanMuc = @category');
        inputParams.category = parseInt(category);
      }

      if (minPrice) {
        whereConditions.push('GiaBan >= @minPrice');
        inputParams.minPrice = parseFloat(minPrice);
      }

      if (maxPrice) {
        whereConditions.push('GiaBan <= @maxPrice');
        inputParams.maxPrice = parseFloat(maxPrice);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        if (key === 'category') {
          request = request.input(key, sql.Int, inputParams[key]);
        } else if (key === 'minPrice' || key === 'maxPrice') {
          request = request.input(key, sql.Decimal(18, 2), inputParams[key]);
        } else {
          request = request.input(key, sql.NVarChar, inputParams[key]);
        }
      });

      const result = await request.query(`
        SELECT COUNT(*) as total FROM SACH ${whereClause}
      `);

      return result.recordset[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Lấy sách theo ID
  static async getById(MaSach) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaSach', sql.Int, MaSach)
        .query(`
          SELECT 
            s.*, 
            d.TenDanMuc,
            CASE 
              WHEN s.SoLuongTon > 10 THEN 'Còn hàng'
              WHEN s.SoLuongTon > 0 THEN 'Sắp hết'
              ELSE 'Hết hàng'
            END as TrangThaiKho
          FROM SACH s 
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc 
          WHERE s.MaSach = @MaSach
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo sách mới
  static async create(sachData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('TenSach', sql.NVarChar(255), sachData.TenSach)
        .input('TacGia', sql.NVarChar(255), sachData.TacGia)
        .input('TheLoai', sql.NVarChar(100), sachData.TheLoai)
        .input('MoTa', sql.NVarChar(1000), sachData.MoTa)
        .input('GiaBan', sql.Decimal(18, 2), sachData.GiaBan)
        .input('SoLuongTon', sql.Int, sachData.SoLuongTon || 0)
        .input('AnhBia', sql.NVarChar(500), sachData.AnhBia)
        .input('MaDanMuc', sql.Int, sachData.MaDanMuc)
        .query(`
          INSERT INTO SACH (TenSach, TacGia, TheLoai, MoTa, GiaBan, SoLuongTon, AnhBia, MaDanMuc)
          OUTPUT INSERTED.*
          VALUES (@TenSach, @TacGia, @TheLoai, @MoTa, @GiaBan, @SoLuongTon, @AnhBia, @MaDanMuc)
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật sách
  static async update(MaSach, sachData) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaSach', sql.Int, MaSach)
        .input('TenSach', sql.NVarChar(255), sachData.TenSach)
        .input('TacGia', sql.NVarChar(255), sachData.TacGia)
        .input('TheLoai', sql.NVarChar(100), sachData.TheLoai)
        .input('MoTa', sql.NVarChar(1000), sachData.MoTa)
        .input('GiaBan', sql.Decimal(18, 2), sachData.GiaBan)
        .input('SoLuongTon', sql.Int, sachData.SoLuongTon)
        .input('AnhBia', sql.NVarChar(500), sachData.AnhBia)
        .input('MaDanMuc', sql.Int, sachData.MaDanMuc)
        .query(`
          UPDATE SACH 
          SET TenSach = @TenSach, TacGia = @TacGia, TheLoai = @TheLoai, 
              MoTa = @MoTa, GiaBan = @GiaBan, SoLuongTon = @SoLuongTon, 
              AnhBia = @AnhBia, MaDanMuc = @MaDanMuc
          OUTPUT INSERTED.*
          WHERE MaSach = @MaSach
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Xóa sách
  static async delete(MaSach) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaSach', sql.Int, MaSach)
        .query('DELETE FROM SACH WHERE MaSach = @MaSach');
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật số lượng tồn kho
  static async updateStock(MaSach, soLuong) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaSach', sql.Int, MaSach)
        .input('SoLuongTon', sql.Int, soLuong)
        .query(`
          UPDATE SACH 
          SET SoLuongTon = @SoLuongTon
          OUTPUT INSERTED.MaSach, INSERTED.SoLuongTon
          WHERE MaSach = @MaSach
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Giảm số lượng tồn kho (khi đặt hàng)
  static async decreaseStock(MaSach, soLuong) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaSach', sql.Int, MaSach)
        .input('SoLuong', sql.Int, soLuong)
        .query(`
          UPDATE SACH 
          SET SoLuongTon = SoLuongTon - @SoLuong
          OUTPUT INSERTED.MaSach, INSERTED.SoLuongTon
          WHERE MaSach = @MaSach AND SoLuongTon >= @SoLuong
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Tăng số lượng tồn kho (khi hủy đơn hàng)
  static async increaseStock(MaSach, soLuong) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('MaSach', sql.Int, MaSach)
        .input('SoLuong', sql.Int, soLuong)
        .query(`
          UPDATE SACH 
          SET SoLuongTon = SoLuongTon + @SoLuong
          OUTPUT INSERTED.MaSach, INSERTED.SoLuongTon
          WHERE MaSach = @MaSach
        `);
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy sách bán chạy
  static async getBestSellers(limit = 10) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            s.MaSach,
            s.TenSach,
            s.TacGia,
            s.GiaBan,
            s.AnhBia,
            s.SoLuongTon,
            d.TenDanMuc,
            SUM(ct.SoLuong) as TongSoLuongBan
          FROM SACH s
          LEFT JOIN CTDONHANG ct ON s.MaSach = ct.MaSach
          LEFT JOIN DONHANG dh ON ct.MaDH = dh.MaDH
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
          WHERE dh.TrangThaiDon = 'HoanThanh'
          GROUP BY s.MaSach, s.TenSach, s.TacGia, s.GiaBan, s.AnhBia, s.SoLuongTon, d.TenDanMuc
          ORDER BY TongSoLuongBan DESC
        `);
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Lấy sách theo danh mục
  static async getByCategory(MaDanMuc, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      const result = await pool.request()
        .input('MaDanMuc', sql.Int, MaDanMuc)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, parseInt(limit))
        .query(`
          SELECT s.*, d.TenDanMuc
          FROM SACH s
          LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
          WHERE s.MaDanMuc = @MaDanMuc
          ORDER BY s.MaSach DESC
          OFFSET @offset ROWS 
          FETCH NEXT @limit ROWS ONLY
        `);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm sách nâng cao
  static async searchAdvanced(keyword, options = {}) {
    try {
      const { category = '', minPrice = '', maxPrice = '', sortBy = 'MaSach', sortOrder = 'DESC' } = options;
      const pool = await poolPromise;

      let whereConditions = ['1=1'];
      let inputParams = { keyword: `%${keyword}%` };

      if (category) {
        whereConditions.push('s.MaDanMuc = @category');
        inputParams.category = parseInt(category);
      }

      if (minPrice) {
        whereConditions.push('s.GiaBan >= @minPrice');
        inputParams.minPrice = parseFloat(minPrice);
      }

      if (maxPrice) {
        whereConditions.push('s.GiaBan <= @maxPrice');
        inputParams.maxPrice = parseFloat(maxPrice);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      let request = pool.request();
      Object.keys(inputParams).forEach(key => {
        if (key === 'category') {
          request = request.input(key, sql.Int, inputParams[key]);
        } else if (key === 'minPrice' || key === 'maxPrice') {
          request = request.input(key, sql.Decimal(18, 2), inputParams[key]);
        } else {
          request = request.input(key, sql.NVarChar, inputParams[key]);
        }
      });

      const validSortColumns = ['MaSach', 'TenSach', 'TacGia', 'GiaBan', 'SoLuongTon'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'MaSach';
      const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      const result = await request.query(`
        SELECT 
          s.*, 
          d.TenDanMuc,
          CASE 
            WHEN s.SoLuongTon > 10 THEN 'Còn hàng'
            WHEN s.SoLuongTon > 0 THEN 'Sắp hết'
            ELSE 'Hết hàng'
          END as TrangThaiKho
        FROM SACH s 
        LEFT JOIN DANHMUCSACH d ON s.MaDanMuc = d.MaDanMuc
        WHERE (s.TenSach LIKE @keyword OR s.TacGia LIKE @keyword OR s.TheLoai LIKE @keyword OR s.MoTa LIKE @keyword)
        ${whereClause.replace('1=1', '').replace('WHERE', 'AND')}
        ORDER BY ${sortColumn} ${sortDirection}
      `);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Sach;