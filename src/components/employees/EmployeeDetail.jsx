import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import LoadingSpinner from '../common/LoadingSpinner'

const EmployeeDetail = () => {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEmployee()
  }, [id])

  const loadEmployee = async () => {
    try {
      const employeeData = await employeeService.getEmployeeById(id)
      setEmployee(employeeData)
    } catch (err) {
      setError('Lỗi tải thông tin nhân viên')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải thông tin..." />
  if (error) return <div className="error-message">{error}</div>
  if (!employee) return <div className="error-message">Không tìm thấy nhân viên</div>

  return (
    <div className="employee-detail">
      <div className="page-header">
        <h1>Chi tiết nhân viên</h1>
        <button 
          className="btn-warning"
          onClick={() => window.location.href = `/admin/employees/edit/${employee.maNhanVien}`}
        >
          Sửa thông tin
        </button>
      </div>

      <div className="employee-info-section">
        <div className="info-grid">
          <div className="info-item">
            <label>Mã nhân viên:</label>
            <span>{employee.maNhanVien}</span>
          </div>
          <div className="info-item">
            <label>Tên đăng nhập:</label>
            <span>{employee.tenDangNhap}</span>
          </div>
          <div className="info-item">
            <label>Họ tên:</label>
            <span>{employee.hoTen}</span>
          </div>
          <div className="info-item">
            <label>Vai trò:</label>
            <span className={`role ${employee.vaiTro.toLowerCase()}`}>
              {employee.vaiTro}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetail