import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import LoadingSpinner from '../common/LoadingSpinner'

const OrderDetail = ({ isAdmin = false }) => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getOrderById(id)
      setOrder(orderData)
    } catch (err) {
      setError('Lỗi tải thông tin đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'ChoXacNhan': 'warning',
      'DangXuLy': 'info',
      'DangGiao': 'primary',
      'HoanThanh': 'success',
      'Huy': 'danger'
    }
    return statusColors[status] || 'default'
  }

  if (loading) return <LoadingSpinner text="Đang tải thông tin đơn hàng..." />
  if (error) return <div className="error-message">{error}</div>
  if (!order) return <div className="error-message">Không tìm thấy đơn hàng</div>

  return (
    <div className="order-detail">
      <div className="page-header">
        <h1>Chi tiết đơn hàng #{order.maDH}</h1>
        <button 
          className="btn-secondary"
          onClick={() => window.location.href = isAdmin ? '/admin/orders' : '/orders'}
        >
          Quay lại
        </button>
      </div>

      <div className="order-info-section">
        <div className="info-grid">
          <div className="info-item">
            <label>Mã đơn hàng:</label>
            <span>#{order.maDH}</span>
          </div>
          <div className="info-item">
            <label>Ngày đặt:</label>
            <span>{new Date(order.ngayDat).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="info-item">
            <label>Tổng tiền:</label>
            <span className="price">{formatPrice(order.tongTien)}</span>
          </div>
          <div className="info-item">
            <label>Trạng thái:</label>
            <span className={`status ${getStatusColor(order.trangThaiDon)}`}>
              {order.trangThaiDon}
            </span>
          </div>
          {order.ghiChu && (
            <div className="info-item full-width">
              <label>Ghi chú:</label>
              <span>{order.ghiChu}</span>
            </div>
          )}
        </div>
      </div>

      <div className="order-items-section">
        <h2>Chi tiết sản phẩm</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sách</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.chiTietDonHang && order.chiTietDonHang.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="product-info">
                      <strong>{item.tenSach}</strong>
                      <br />
                      <small>Tác giả: {item.tacGia}</small>
                    </div>
                  </td>
                  <td>{formatPrice(item.donGia)}</td>
                  <td>{item.soLuong}</td>
                  <td>{formatPrice(item.thanhTien)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right"><strong>Tổng cộng:</strong></td>
                <td><strong>{formatPrice(order.tongTien)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {order.thongTinThanhToan && (
        <div className="payment-info-section">
          <h2>Thông tin thanh toán</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Phương thức:</label>
              <span>{order.thongTinThanhToan.phuongThuc}</span>
            </div>
            <div className="info-item">
              <label>Số tiền:</label>
              <span>{formatPrice(order.thongTinThanhToan.soTien)}</span>
            </div>
            <div className="info-item">
              <label>Trạng thái:</label>
              <span className={`status ${order.thongTinThanhToan.trangThai.toLowerCase()}`}>
                {order.thongTinThanhToan.trangThai}
              </span>
            </div>
            <div className="info-item">
              <label>Ngày thanh toán:</label>
              <span>
                {order.thongTinThanhToan.ngayThanhToan 
                  ? new Date(order.thongTinThanhToan.ngayThanhToan).toLocaleDateString('vi-VN')
                  : 'Chưa thanh toán'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail