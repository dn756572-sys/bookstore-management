import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import SearchBar from './SearchBar'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { getCartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Xử lý lỗi nếu getCartCount trả về không phải số
  const cartCount = typeof getCartCount === 'function' ? getCartCount() : 0

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>BookStore</h1>
          </Link>

          <SearchBar />

          <nav className="nav">
            <Link to="/books" className="nav-link">Sách</Link>
            
            {isAuthenticated ? (
              <>
                {user?.vaiTro === 'Admin' || user?.vaiTro === 'NhanVien' ? (
                  <Link to="/admin" className="nav-link">Quản lý</Link>
                ) : (
                  <>
                    <Link to="/cart" className="nav-link cart-link">
                      Giỏ hàng ({cartCount})
                    </Link>
                    <Link to="/profile" className="nav-link">Tài khoản</Link>
                  </>
                )}
                <div className="user-menu">
                  <span>Xin chào, {user?.hoTen || 'User'}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Đăng nhập</Link>
                <Link to="/register" className="nav-link">Đăng ký</Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header