import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { employeeService } from '../../services/employeeService'
import LoadingSpinner from '../common/LoadingSpinner'

const EmployeeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      loadEmployee()
    }
  }, [id])

  const loadEmployee = async () => {
    try {
      const employee = await employeeService.getEmployeeById(id)
      setValue('tenDangNhap', employee.tenDangNhap)
      setValue('hoTen', employee.hoTen)
      setValue('vaiTro', employee.vaiTro)
    } catch (err) {
      setError('Lỗi tải thông tin nhân viên')
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      if (isEdit) {
        await employeeService.updateEmployee(id, data)
        alert('Cập nhật nhân viên thành công')
      } else {
        await employeeService.createEmployee(data)
        alert('Thêm nhân viên thành công')
      }

      navigate('/admin/employees')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu nhân viên')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>{isEdit ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="employee-form">
        <div className="form-group">
          <label>Tên đăng nhập *</label>
          <input
            type="text"
            {...register('tenDangNhap', { required: 'Vui lòng nhập tên đăng nhập' })}
            disabled={isEdit}
          />
          {errors.tenDangNhap && <span className="error">{errors.tenDangNhap.message}</span>}
        </div>

        <div className="form-group">
          <label>Họ tên *</label>
          <input
            type="text"
            {...register('hoTen', { required: 'Vui lòng nhập họ tên' })}
          />
          {errors.hoTen && <span className="error">{errors.hoTen.message}</span>}
        </div>

        {!isEdit && (
          <div className="form-group">
            <label>Mật khẩu *</label>
            <input
              type="password"
              {...register('matKhau', { 
                required: 'Vui lòng nhập mật khẩu',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự'
                }
              })}
            />
            {errors.matKhau && <span className="error">{errors.matKhau.message}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Vai trò *</label>
          <select {...register('vaiTro', { required: 'Vui lòng chọn vai trò' })}>
            <option value="NhanVien">Nhân viên</option>
            <option value="QuanLy">Quản lý</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.vaiTro && <span className="error">{errors.vaiTro.message}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/employees')}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm