const { poolPromise, sql } = require('../config/database');
const { getPagination } = require('../utils/helpers');

const getAllCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const { offset } = getPagination(page, limit);

    const pool = await poolPromise;

    let whereCondition = '';
    let request = pool.request();

    if (search) {
      whereCondition = 'WHERE TenDanMuc LIKE @search OR MoTa LIKE @search';
      request = request.input('search', sql.NVarChar, `%${search}%`);
    }

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total FROM DANHMUCSACH ${whereCondition}
    `);
    const total = countResult.recordset[0].total;

    // Get categories with pagination
    const result = await request
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, parseInt(limit))
      .query(`
        SELECT *, 
          (SELECT COUNT(*) FROM SACH WHERE MaDanMuc = DANHMUCSACH.MaDanMuc) as SoLuongSach
        FROM DANHMUCSACH 
        ${whereCondition}
        ORDER BY MaDanMuc DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: {
        categories: result.recordset,
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

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .query(`
        SELECT *,
          (SELECT COUNT(*) FROM SACH WHERE MaDanMuc = @MaDanMuc) as SoLuongSach
        FROM DANHMUCSACH 
        WHERE MaDanMuc = @MaDanMuc
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        category: result.recordset[0]
      }
    });

  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { TenDanMuc, MoTa } = req.body;
    const pool = await poolPromise;

    // Check if category name already exists
    const existingCategory = await pool.request()
      .input('TenDanMuc', sql.NVarChar, TenDanMuc)
      .query('SELECT MaDanMuc FROM DANHMUCSACH WHERE TenDanMuc = @TenDanMuc');

    if (existingCategory.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên danh mục đã tồn tại'
      });
    }

    const result = await pool.request()
      .input('TenDanMuc', sql.NVarChar, TenDanMuc)
      .input('MoTa', sql.NVarChar, MoTa)
      .query(`
        INSERT INTO DANHMUCSACH (TenDanMuc, MoTa)
        OUTPUT INSERTED.*
        VALUES (@TenDanMuc, @MoTa)
      `);

    const newCategory = result.recordset[0];

    res.status(201).json({
      status: 'success',
      message: 'Thêm danh mục thành công',
      data: {
        category: newCategory
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenDanMuc, MoTa } = req.body;
    const pool = await poolPromise;

    // Check if category exists
    const existingCategory = await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .query('SELECT MaDanMuc FROM DANHMUCSACH WHERE MaDanMuc = @MaDanMuc');

    if (existingCategory.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục'
      });
    }

    // Check if category name already exists (excluding current category)
    const duplicateCategory = await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .input('TenDanMuc', sql.NVarChar, TenDanMuc)
      .query('SELECT MaDanMuc FROM DANHMUCSACH WHERE TenDanMuc = @TenDanMuc AND MaDanMuc != @MaDanMuc');

    if (duplicateCategory.recordset.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Tên danh mục đã tồn tại'
      });
    }

    const result = await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .input('TenDanMuc', sql.NVarChar, TenDanMuc)
      .input('MoTa', sql.NVarChar, MoTa)
      .query(`
        UPDATE DANHMUCSACH 
        SET TenDanMuc = @TenDanMuc, MoTa = @MoTa
        OUTPUT INSERTED.*
        WHERE MaDanMuc = @MaDanMuc
      `);

    const updatedCategory = result.recordset[0];

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật danh mục thành công',
      data: {
        category: updatedCategory
      }
    });

  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    // Check if category exists
    const existingCategory = await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .query('SELECT MaDanMuc FROM DANHMUCSACH WHERE MaDanMuc = @MaDanMuc');

    if (existingCategory.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục'
      });
    }

    // Check if category has books
    const booksCheck = await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .query('SELECT COUNT(*) as bookCount FROM SACH WHERE MaDanMuc = @MaDanMuc');

    if (booksCheck.recordset[0].bookCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Không thể xóa danh mục đang có sách'
      });
    }

    await pool.request()
      .input('MaDanMuc', sql.Int, id)
      .query('DELETE FROM DANHMUCSACH WHERE MaDanMuc = @MaDanMuc');

    res.status(200).json({
      status: 'success',
      message: 'Xóa danh mục thành công'
    });

  } catch (error) {
    next(error);
  }
};

const getCategoryStats = async (req, res, next) => {
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

    res.status(200).json({
      status: 'success',
      data: {
        stats: result.recordset
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
};