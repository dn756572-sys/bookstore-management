import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const { register: registerUser, authLoading } = useAuth() // SỬA: dùng authLoading thay vì loading
  const [error, setError] = useState('')

  const password = watch('password')

  const onSubmit = async (data) => {
    setError('')
    
    // SỬA QUAN TRỌNG: Chuẩn hóa data gửi lên backend
    const registerData = {
      HoTen: data.hoTen,
      Email: data.email,
      MatKhau: data.password, // Gửi cả MatKhau và password để backend nhận cả 2
      password: data.password,
      SoDienThoai: data.soDienThoai || '',
      DiaChi: data.diaChi || ''
    }

    console.log('📝 Sending register data:', registerData)

    const result = await registerUser(registerData)
    if (!result.success) {
      setError(result.message)
    } else {
      console.log('✅ Register successful, user:', result.user)
      // Có thể thêm redirect hoặc thông báo thành công ở đây
    }
  }

  return (
    <div className="auth-form">
      <h2>Đăng ký tài khoản</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Họ tên *</label>
          <input
            type="text"
            {...register('hoTen', { required: 'Vui lòng nhập họ tên' })}
          />
          {errors.hoTen && <span className="error">{errors.hoTen.message}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            {...register('email', { 
              required: 'Vui lòng nhập email',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không hợp lệ'
              }
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            {...register('soDienThoai')}
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input
            type="text"
            {...register('diaChi')}
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu *</label>
          <input
            type="password"
            {...register('password', { 
              required: 'Vui lòng nhập mật khẩu',
              minLength: {
                value: 6,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
              }
            })}
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu *</label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Vui lòng xác nhận mật khẩu',
              validate: value => value === password || 'Mật khẩu xác nhận không khớp'
            })}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={authLoading}>
          {authLoading ? <LoadingSpinner size="small" /> : 'Đăng ký'}
        </button>
      </form>
    </div>
  )
}

export default Register