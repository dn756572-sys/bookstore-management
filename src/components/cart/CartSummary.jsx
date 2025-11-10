import React from 'react'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'

const CartSummary = () => {
  const { getCartTotal, getCartCount } = useCart()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const cartTotal = typeof getCartTotal === 'function' ? getCartTotal() : 0
  const cartCount = typeof getCartCount === 'function' ? getCartCount() : 0

  return (
    <div className="cart-summary">
      <h3>Tóm tắt đơn hàng</h3>
      
      <div className="summary-details">
        <div className="summary-row">
          <span>Số lượng sản phẩm:</span>
          <span>{cartCount}</span>
        </div>
        
        <div className="summary-row">
          <span>Tạm tính:</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
        
        <div className="summary-row">
          <span>Phí vận chuyển:</span>
          <span>Miễn phí</span>
        </div>
        
        <div className="summary-row total">
          <span>Tổng cộng:</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
      </div>

      <div className="summary-actions">
        <Link to="/checkout" className="btn-primary large">
          Tiến hành đặt hàng
        </Link>
        
        <Link to="/books" className="btn-secondary">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  )
}

export default CartSummary