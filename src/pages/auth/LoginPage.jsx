import React from 'react'
import Layout from '../../components/common/Layout'
import Login from '../../components/auth/Login'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  return (
    <Layout>
      <div className="auth-page">
        <div className="container">
          <div className="auth-container">
            <Login />
            <div className="auth-links">
              <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage