import React, { useState, useEffect } from 'react'
import { employeeService } from '../../services/employeeService'
import LoadingSpinner from '../common/LoadingSpinner'

const EmployeeList = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees()
      setEmployees(data)
    } catch (err) {
      setError('Lỗi tải danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        await employeeService.deleteEmployee(employeeId)
        loadEmployees()
      } catch (err) {
        setError('Lỗi xóa nhân viên')
      }
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải nhân viên..." />

  return (
    <div className="employee-list">
      <div className="page-header">
        <h1>Quản lý Nhân viên</h1>
        <button 
          className="btn-primary"
          onClick={() => window.location.href = '/admin/employees/new'}
        >
          Thêm nhân viên
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(employee => (
              <tr key={employee.maNhanVien}>
                <td>{employee.maNhanVien}</td>
                <td>{employee.tenDangNhap}</td>
                <td>{employee.hoTen}</td>
                <td>
                  <span className={`role ${employee.vaiTro.toLowerCase()}`}>
                    {employee.vaiTro}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-warning"
                      onClick={() => window.location.href = `/admin/employees/edit/${employee.maNhanVien}`}
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.maNhanVien)}
                      className="btn-danger"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && !loading && (
        <div className="empty-state">
          <p>Chưa có nhân viên nào</p>
        </div>
      )}
    </div>
  )
}

export default EmployeeList