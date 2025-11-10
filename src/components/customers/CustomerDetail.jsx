import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { customerService } from '../../services/customerService'
import LoadingSpinner from '../common/LoadingSpinner'

const CustomerDetail = () => {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCustomerData()
  }, [id])

  const loadCustomerData = async () => {
    try {
      const [customerData, ordersData] = await Promise.all([
        customerService.getCustomerById(id),
        customerService.getCustomerOrders(id)
      ])
      setCustomer(customerData)
      setOrders(ordersData)
    } catch (err) {
      setError('Lỗi tải thông tin khách hàng')
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

  if (loading) return <LoadingSpinner text="Đang tải thông tin..." />
  if (error) return <div className="error-message">{error}</div>
  if (!customer) return <div className="error-message">Không tìm thấy khách hàng</div>

  return (
    <div className="customer-detail">
      <div className="page-header">
        <h1>Chi tiết khách hàng</h1>
      </div>

      <div className="customer-info-section">
        <h2>Thông tin cá nhân</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Mã KH:</label>
            <span>{customer.maKH}</span>
          </div>
          <div className="info-item">
            <label>Họ tên:</label>
            <span>{customer.hoTen}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{customer.email}</span>
          </div>
          <div className="info-item">
            <label>Số điện thoại:</label>
            <span>{customer.soDienThoai || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Địa chỉ:</label>
            <span>{customer.diaChi || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>Ngày đăng ký:</label>
            <span>{new Date(customer.ngayDangKy).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="info-item">
            <label>Trạng thái:</label>
            <span className={`status ${customer.trangThai ? 'active' : 'inactive'}`}>
              {customer.trangThai ? 'Hoạt động' : 'Khóa'}
            </span>
          </div>
        </div>
      </div>

      <div className="customer-orders-section">
        <h2>Lịch sử đơn hàng</h2>
        {orders.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.maDH}>
                    <td>{order.maDH}</td>
                    <td>{new Date(order.ngayDat).toLocaleDateString('vi-VN')}</td>
                    <td>{formatPrice(order.tongTien)}</td>
                    <td>
                      <span className={`status ${order.trangThaiDon.toLowerCase()}`}>
                        {order.trangThaiDon}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Khách hàng chưa có đơn hàng nào</p>
        )}
      </div>
    </div>
  )
}

export default CustomerDetail