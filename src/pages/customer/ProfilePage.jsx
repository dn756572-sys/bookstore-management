import React, { useState } from 'react'
import Layout from '../../components/common/Layout'
import { useAuth } from '../../context/AuthContext'
import { useForm } from 'react-hook-form'
import { authService } from '../../services/authService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setMessage('')
      await authService.updateProfile(data)
      setMessage('Cập nhật thông tin thành công')
    } catch (err) {
      setMessage('Lỗi cập nhật thông tin')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container">
          <div className="error-message">Vui lòng đăng nhập để xem thông tin</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="profile-page">
        <div className="container">
          <h1>Thông tin tài khoản</h1>
          
          {message && (
            <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="profile-content">
            <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  defaultValue={user.hoTen}
                  {...register('hoTen', { required: 'Vui lòng nhập họ tên' })}
                />
                {errors.hoTen && <span className="error">{errors.hoTen.message}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="disabled"
                />
                <small>Email không thể thay đổi</small>
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  defaultValue={user.soDienThoai}
                  {...register('soDienThoai')}
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  rows="3"
                  defaultValue={user.diaChi}
                  {...register('diaChi')}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : 'Cập nhật thông tin'}
              </button>
            </form>

            <div className="profile-actions">
              <button onClick={logout} className="btn-danger">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage