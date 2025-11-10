const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('❌ Error:', err);

  // SQL Server errors
  if (err.name === 'RequestError') {
    const message = 'Lỗi database request';
    error = { message, statusCode: 500 };
  }

  if (err.name === 'ConnectionError') {
    const message = 'Lỗi kết nối database';
    error = { message, statusCode: 503 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Lỗi server nội bộ'
  });
};

module.exports = errorHandler;