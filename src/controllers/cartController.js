const { poolPromise, sql } = require('../config/database');

const getCart = async (req, res, next) => {
  try {
    const { id: MaKH, role } = req.user;

    // Chỉ cho phép customer truy cập giỏ hàng
    if (role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Chỉ khách hàng mới có thể truy cập giỏ hàng'
      });
    }

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

    // Tính tổng
    const total = result.recordset.reduce((sum, item) => sum + parseFloat(item.ThanhTien), 0);
    const totalItems = result.recordset.reduce((sum, item) => sum + item.SoLuong, 0);

    res.status(200).json({
      status: 'success',
      data: {
        items: result.recordset,
        summary: {
          totalItems,
          totalAmount: total
        }
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi lấy giỏ hàng'
    });
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { id: MaKH, role } = req.user;
    const { MaSach, SoLuong = 1 } = req.body;

    if (role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Chỉ khách hàng mới có thể thêm vào giỏ hàng'
      });
    }

    if (!MaSach || !SoLuong || SoLuong < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Dữ liệu không hợp lệ'
      });
    }

    const pool = await poolPromise;

    // Kiểm tra sách tồn tại và số lượng
    const bookResult = await pool.request()
      .input('MaSach', sql.Int, MaSach)
      .query('SELECT TenSach, GiaBan, SoLuongTon FROM SACH WHERE MaSach = @MaSach');

    if (bookResult.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sách không tồn tại'
      });
    }

    const book = bookResult.recordset[0];

    if (book.SoLuongTon < SoLuong) {
      return res.status(400).json({
        status: 'error',
        message: `Số lượng tồn kho không đủ. Chỉ còn ${book.SoLuongTon} sản phẩm`
      });
    }

    // Kiểm tra sách đã có trong giỏ hàng chưa
    const existingItem = await pool.request()
      .input('MaKH', sql.Int, MaKH)
      .input('MaSach', sql.Int, MaSach)
      .query('SELECT MaGH, SoLuong FROM GIOHANG WHERE MaKH = @MaKH AND MaSach = @MaSach');

    let result;
    const ThanhTien = book.GiaBan * SoLuong;

    if (existingItem.recordset.length > 0) {
      // Cập nhật số lượng
      const newQuantity = existingItem.recordset[0].SoLuong + SoLuong;
      
      if (book.SoLuongTon < newQuantity) {
        return res.status(400).json({
          status: 'error',
          message: `Tổng số lượng trong giỏ hàng vượt quá tồn kho. Chỉ còn ${book.SoLuongTon} sản phẩm`
        });
      }

      result = await pool.request()
        .input('MaGH', sql.Int, existingItem.recordset[0].MaGH)
        .input('SoLuong', sql.Int, newQuantity)
        .input('ThanhTien', sql.Decimal(18, 2), book.GiaBan * newQuantity)
        .query(`
          UPDATE GIOHANG 
          SET SoLuong = @SoLuong, ThanhTien = @ThanhTien
          WHERE MaGH = @MaGH
        `);
    } else {
      // Thêm mới
      result = await pool.request()
        .input('MaKH', sql.Int, MaKH)
        .input('MaSach', sql.Int, MaSach)
        .input('SoLuong', sql.Int, SoLuong)
        .input('ThanhTien', sql.Decimal(18, 2), ThanhTien)
        .query(`
          INSERT INTO GIOHANG (MaKH, MaSach, SoLuong, ThanhTien)
          VALUES (@MaKH, @MaSach, @SoLuong, @ThanhTien)
        `);
    }

    res.status(200).json({
      status: 'success',
      message: 'Đã thêm vào giỏ hàng',
      data: {
        MaSach,
        SoLuong: existingItem.recordset.length > 0 ? existingItem.recordset[0].SoLuong + SoLuong : SoLuong
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi thêm vào giỏ hàng'
    });
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id: MaKH, role } = req.user;
    const { MaSach } = req.params;
    const { SoLuong } = req.body;

    if (role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Chỉ khách hàng mới có thể cập nhật giỏ hàng'
      });
    }

    if (!SoLuong || SoLuong < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Số lượng không hợp lệ'
      });
    }

    const pool = await poolPromise;

    // Kiểm tra sách tồn tại
    const bookResult = await pool.request()
      .input('MaSach', sql.Int, MaSach)
      .query('SELECT GiaBan, SoLuongTon FROM SACH WHERE MaSach = @MaSach');

    if (bookResult.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sách không tồn tại'
      });
    }

    const book = bookResult.recordset[0];

    if (book.SoLuongTon < SoLuong) {
      return res.status(400).json({
        status: 'error',
        message: `Số lượng tồn kho không đủ. Chỉ còn ${book.SoLuongTon} sản phẩm`
      });
    }

    // Kiểm tra item có trong giỏ hàng không
    const existingItem = await pool.request()
      .input('MaKH', sql.Int, MaKH)
      .input('MaSach', sql.Int, MaSach)
      .query('SELECT MaGH FROM GIOHANG WHERE MaKH = @MaKH AND MaSach = @MaSach');

    if (existingItem.recordset.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sản phẩm không tồn tại trong giỏ hàng'
      });
    }

    const ThanhTien = book.GiaBan * SoLuong;

    await pool.request()
      .input('MaKH', sql.Int, MaKH)
      .input('MaSach', sql.Int, MaSach)
      .input('SoLuong', sql.Int, SoLuong)
      .input('ThanhTien', sql.Decimal(18, 2), ThanhTien)
      .query(`
        UPDATE GIOHANG 
        SET SoLuong = @SoLuong, ThanhTien = @ThanhTien
        WHERE MaKH = @MaKH AND MaSach = @MaSach
      `);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật giỏ hàng thành công'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi cập nhật giỏ hàng'
    });
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { id: MaKH, role } = req.user;
    const { MaSach } = req.params;

    if (role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Chỉ khách hàng mới có thể xóa khỏi giỏ hàng'
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaKH', sql.Int, MaKH)
      .input('MaSach', sql.Int, MaSach)
      .query('DELETE FROM GIOHANG WHERE MaKH = @MaKH AND MaSach = @MaSach');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sản phẩm không tồn tại trong giỏ hàng'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa sản phẩm khỏi giỏ hàng'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi xóa khỏi giỏ hàng'
    });
  }
};

const clearCart = async (req, res, next) => {
  try {
    const { id: MaKH, role } = req.user;

    if (role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Chỉ khách hàng mới có thể xóa giỏ hàng'
      });
    }

    const pool = await poolPromise;

    await pool.request()
      .input('MaKH', sql.Int, MaKH)
      .query('DELETE FROM GIOHANG WHERE MaKH = @MaKH');

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa toàn bộ giỏ hàng'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi xóa giỏ hàng'
    });
  }
};

const getCartCount = async (req, res, next) => {
  try {
    const { id: MaKH, role } = req.user;

    if (role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Chỉ khách hàng mới có thể truy cập giỏ hàng'
      });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('MaKH', sql.Int, MaKH)
      .query('SELECT COUNT(*) as count, SUM(SoLuong) as totalItems FROM GIOHANG WHERE MaKH = @MaKH');

    res.status(200).json({
      status: 'success',
      data: {
        count: result.recordset[0].count,
        totalItems: result.recordset[0].totalItems || 0
      }
    });

  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi lấy số lượng giỏ hàng'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};