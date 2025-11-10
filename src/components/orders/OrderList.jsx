import React, { useState, useEffect } from 'react'
import { orderService } from '../../services/orderService'
import LoadingSpinner from '../common/LoadingSpinner'
import Pagination from '../common/Pagination'

const OrderList = ({ isAdmin = false }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  })
  const [pagination, setPagination] = useState({})

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = isAdmin 
        ? await orderService.getAllOrders(filters)
        : await orderService.getMyOrders()
      
      setOrders(response.data || response.orders || [])
      setPagination(response.pagination || {})
    } catch (err) {
      setError('Lỗi tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [filters, isAdmin])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (err) {
      setError('Lỗi cập nhật trạng thái đơn hàng')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
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

  if (loading) return <LoadingSpinner text="Đang tải đơn hàng..." />

  return (
    <div className="order-list">
      <div className="page-header">
        <h1>{isAdmin ? 'Quản lý Đơn hàng' : 'Lịch sử Đơn hàng'}</h1>
        
        {isAdmin && (
          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ChoXacNhan">Chờ xác nhận</option>
              <option value="DangXuLy">Đang xử lý</option>
              <option value="DangGiao">Đang giao</option>
              <option value="HoanThanh">Hoàn thành</option>
              <option value="Huy">Hủy</option>
            </select>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              {isAdmin && <th>Khách hàng</th>}
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.maDH}>
                <td>#{order.maDH}</td>
                <td>{new Date(order.ngayDat).toLocaleDateString('vi-VN')}</td>
                <td>{formatPrice(order.tongTien)}</td>
                <td>
                  {isAdmin ? (
                    <select
                      value={order.trangThaiDon}
                      onChange={(e) => handleStatusChange(order.maDH, e.target.value)}
                    >
                      <option value="ChoXacNhan">Chờ xác nhận</option>
                      <option value="DangXuLy">Đang xử lý</option>
                      <option value="DangGiao">Đang giao</option>
                      <option value="HoanThanh">Hoàn thành</option>
                      <option value="Huy">Hủy</option>
                    </select>
                  ) : (
                    <span className={`status ${getStatusColor(order.trangThaiDon)}`}>
                      {order.trangThaiDon}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td>{order.hoTen || order.tenKhachHang || 'N/A'}</td>
                )}
                <td>
                  <button 
                    className="btn-secondary"
                    onClick={() => window.location.href = `${isAdmin ? '/admin' : ''}/orders/${order.maDH}`}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && !loading && (
        <div className="empty-state">
          <p>Không tìm thấy đơn hàng nào</p>
        </div>
      )}

      {isAdmin && pagination.totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export default OrderList