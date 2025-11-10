import React from 'react'
import Layout from '../../components/common/Layout'
import Register from '../../components/auth/Register'
import { Link } from 'react-router-dom'

const RegisterPage = () => {
  return (
    <Layout>
      <div className="auth-page">
        <div className="container">
          <div className="auth-container">
            <Register />
            <div className="auth-links">
              <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default RegisterPage