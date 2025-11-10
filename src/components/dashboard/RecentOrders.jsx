import React from 'react'
import { Link } from 'react-router-dom'

const RecentOrders = ({ orders = [] }) => {
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

  if (orders.length === 0) {
    return (
      <div className="recent-orders">
        <h3>Đơn hàng gần đây</h3>
        <p>Chưa có đơn hàng nào</p>
      </div>
    )
  }

  return (
    <div className="recent-orders">
      <div className="section-header">
        <h3>Đơn hàng gần đây</h3>
        <Link to="/admin/orders" className="view-all">Xem tất cả</Link>
      </div>

      <div className="orders-list">
        {orders.slice(0, 5).map(order => (
          <div key={order.maDH} className="order-item">
            <div className="order-info">
              <div className="order-id">#{order.maDH}</div>
              <div className="order-customer">{order.hoTen || 'Khách hàng'}</div>
              <div className="order-date">
                {new Date(order.ngayDat).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div className="order-details">
              <div className="order-amount">{formatPrice(order.tongTien)}</div>
              <span className={`status ${getStatusColor(order.trangThaiDon)}`}>
                {order.trangThaiDon}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentOrders