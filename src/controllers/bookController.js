const { poolPromise, sql } = require('../config/database');
const { getPagination } = require('../utils/helpers');

const getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    let whereConditions = ['s.SoLuongTon >= 0'];
    let inputParams = {};

    if (search) {
      whereConditions.push('(s.TenSach LIKE @search OR s.TacGia LIKE @search)');
      inputParams.search = `%${search}%`;
    }

    if (category) {
      whereConditions.push('s.MaDanMuc = @category');
      inputParams.category = parseInt(category);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build request
    let request = pool.request();
    Object.keys(inputParams).forEach(key => {
      if (key === 'category') {
        request = request.input(key, sql.Int, inputParams[key]);
      } else {
        request = request.input(key, sql.NVarChar, inputParams[key]);
      }
    });

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total 
      FROM SACH s 
      ${whereClause}
    `);

    const total = countResult.recordset[0].total;

    // Get books with pagination
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

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        books: result.recordset,
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

const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaSach', sql.Int, id)
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

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sách'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        book: result.recordset[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const {
      TenSach,
      TacGia,
      TheLoai,
      MoTa,
      GiaBan,
      SoLuongTon,
      AnhBia,
      MaDanMuc
    } = req.body;

    const pool = await poolPromise;

    const result = await pool.request()
      .input('TenSach', sql.NVarChar, TenSach)
      .input('TacGia', sql.NVarChar, TacGia)
      .input('TheLoai', sql.NVarChar, TheLoai)
      .input('MoTa', sql.NVarChar, MoTa)
      .input('GiaBan', sql.Decimal(18, 2), GiaBan)
      .input('SoLuongTon', sql.Int, SoLuongTon)
      .input('AnhBia', sql.NVarChar, AnhBia)
      .input('MaDanMuc', sql.Int, MaDanMuc)
      .query(`
        INSERT INTO SACH (TenSach, TacGia, TheLoai, MoTa, GiaBan, SoLuongTon, AnhBia, MaDanMuc)
        OUTPUT INSERTED.*
        VALUES (@TenSach, @TacGia, @TheLoai, @MoTa, @GiaBan, @SoLuongTon, @AnhBia, @MaDanMuc)
      `);

    const newBook = result.recordset[0];

    res.status(201).json({
      status: 'success',
      message: 'Thêm sách thành công',
      data: {
        book: newBook
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      TenSach,
      TacGia,
      TheLoai,
      MoTa,
      GiaBan,
      SoLuongTon,
      AnhBia,
      MaDanMuc
    } = req.body;

    const pool = await poolPromise;

    // Check if book exists
    const existingBook = await pool.request()
      .input('MaSach', sql.Int, id)
      .query('SELECT MaSach FROM SACH WHERE MaSach = @MaSach');

    if (existingBook.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sách'
      });
    }

    const result = await pool.request()
      .input('MaSach', sql.Int, id)
      .input('TenSach', sql.NVarChar, TenSach)
      .input('TacGia', sql.NVarChar, TacGia)
      .input('TheLoai', sql.NVarChar, TheLoai)
      .input('MoTa', sql.NVarChar, MoTa)
      .input('GiaBan', sql.Decimal(18, 2), GiaBan)
      .input('SoLuongTon', sql.Int, SoLuongTon)
      .input('AnhBia', sql.NVarChar, AnhBia)
      .input('MaDanMuc', sql.Int, MaDanMuc)
      .query(`
        UPDATE SACH 
        SET TenSach = @TenSach, TacGia = @TacGia, TheLoai = @TheLoai, 
            MoTa = @MoTa, GiaBan = @GiaBan, SoLuongTon = @SoLuongTon, 
            AnhBia = @AnhBia, MaDanMuc = @MaDanMuc
        OUTPUT INSERTED.*
        WHERE MaSach = @MaSach
      `);

    const updatedBook = result.recordset[0];

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật sách thành công',
      data: {
        book: updatedBook
      }
    });

  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Check if book exists
    const existingBook = await pool.request()
      .input('MaSach', sql.Int, id)
      .query('SELECT MaSach FROM SACH WHERE MaSach = @MaSach');

    if (existingBook.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sách'
      });
    }

    // Check if book is in any order
    const orderCheck = await pool.request()
      .input('MaSach', sql.Int, id)
      .query('SELECT TOP 1 MaDH FROM CTDONHANG WHERE MaSach = @MaSach');

    if (orderCheck.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa sách đã có trong đơn hàng'
      });
    }

    await pool.request()
      .input('MaSach', sql.Int, id)
      .query('DELETE FROM SACH WHERE MaSach = @MaSach');

    res.status(200).json({
      status: 'success',
      message: 'Xóa sách thành công'
    });

  } catch (error) {
    next(error);
  }
};

const getBooksByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    // Get total count
    const countResult = await pool.request()
      .input('MaDanMuc', sql.Int, categoryId)
      .query('SELECT COUNT(*) as total FROM SACH WHERE MaDanMuc = @MaDanMuc');

    const total = countResult.recordset[0].total;

    // Get books
    const result = await pool.request()
      .input('MaDanMuc', sql.Int, categoryId)
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

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        books: result.recordset,
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

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByCategory
};