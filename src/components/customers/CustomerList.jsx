import React, { useState, useEffect } from 'react'
import { customerService } from '../../services/customerService'
import LoadingSpinner from '../common/LoadingSpinner'
import Pagination from '../common/Pagination'

const CustomerList = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  })
  const [pagination, setPagination] = useState({})

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await customerService.getAllCustomers(filters)
      setCustomers(response.data || response.customers || [])
      setPagination(response.pagination || {})
    } catch (err) {
      setError('Lỗi tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [filters])

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      await customerService.updateCustomer(customerId, { trangThai: newStatus })
      loadCustomers()
    } catch (err) {
      setError('Lỗi cập nhật trạng thái')
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải khách hàng..." />

  return (
    <div className="customer-list">
      <div className="page-header">
        <h1>Quản lý Khách hàng</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã KH</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.maKH}>
                <td>{customer.maKH}</td>
                <td>{customer.hoTen}</td>
                <td>{customer.email}</td>
                <td>{customer.soDienThoai || 'N/A'}</td>
                <td>{customer.diaChi || 'N/A'}</td>
                <td>{new Date(customer.ngayDangKy).toLocaleDateString('vi-VN')}</td>
                <td>
                  <select
                    value={customer.trangThai ? 1 : 0}
                    onChange={(e) => handleStatusChange(customer.maKH, Boolean(parseInt(e.target.value)))}
                  >
                    <option value={1}>Hoạt động</option>
                    <option value={0}>Khóa</option>
                  </select>
                </td>
                <td>
                  <button 
                    className="btn-warning"
                    onClick={() => window.location.href = `/admin/customers/${customer.maKH}`}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && !loading && (
        <div className="empty-state">
          <p>Không tìm thấy khách hàng nào</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export default CustomerList