import React from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import LoadingSpinner from '../common/LoadingSpinner'
import { Link } from 'react-router-dom'

const Cart = () => {
  const { cartItems, loading, getCartTotal } = useCart()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="cart-empty">
        <h2>Giỏ hàng</h2>
        <div className="empty-state">
          <p>Vui lòng đăng nhập để xem giỏ hàng</p>
          <Link to="/login" className="btn-primary">Đăng nhập</Link>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingSpinner text="Đang tải giỏ hàng..." />

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Giỏ hàng</h2>
        <div className="empty-state">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to="/books" className="btn-primary">Tiếp tục mua sắm</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart">
      <h2>Giỏ hàng</h2>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <CartItem key={item.maSach} item={item} />
          ))}
        </div>
        
        <div className="cart-sidebar">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}

export default Cart