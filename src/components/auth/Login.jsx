import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom' // Thêm useNavigate
import LoadingSpinner from '../common/LoadingSpinner'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login, user, authLoading } = useAuth() // Sử dụng authLoading thay vì loading
  const [error, setError] = useState('')
  const navigate = useNavigate() // Thêm navigate

  // SỬA: Thêm useEffect để redirect khi user thay đổi
  useEffect(() => {
    if (user) {
      // Redirect dựa trên role của user
      if (user.vaiTro === 'Admin' || user.role === 'employee') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }, [user, navigate])

  const onSubmit = async (data) => {
    setError('')
    const result = await login(data)
    if (!result.success) {
      setError(result.message)
    }
    // Không cần redirect ở đây vì đã có useEffect xử lý
  }

  return (
    <div className="auth-form">
      <h2>Đăng nhập</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Email hoặc Tên đăng nhập</label>
          <input
            type="text"
            {...register('username', { required: 'Vui lòng nhập email hoặc tên đăng nhập' })}
          />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <button type="submit" className="btn-primary" disabled={authLoading}>
          {authLoading ? <LoadingSpinner size="small" /> : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

export default Login