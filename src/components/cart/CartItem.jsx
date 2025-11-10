import React, { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart()
  const [quantity, setQuantity] = useState(item.soLuong)
  const [updating, setUpdating] = useState(false)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return
    
    try {
      setUpdating(true)
      setQuantity(newQuantity)
      await updateCartItem(item.maSach, newQuantity)
    } catch (error) {
      setQuantity(item.soLuong) // Revert on error
      alert('Lỗi cập nhật số lượng')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      await removeFromCart(item.maSach)
    }
  }

  return (
    <div className="cart-item">
      <div className="item-image">
        {item.anhBia ? (
          <img src={`http://localhost:5000/uploads/images/${item.anhBia}`} alt={item.tenSach} />
        ) : (
          <div className="image-placeholder">📚</div>
        )}
      </div>

      <div className="item-details">
        <Link to={`/books/${item.maSach}`} className="item-title">
          {item.tenSach}
        </Link>
        <p className="item-author">Tác giả: {item.tacGia}</p>
        <p className="item-price">{formatPrice(item.donGia)}</p>
      </div>

      <div className="item-quantity">
        <button 
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || updating}
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          onBlur={() => handleQuantityChange(quantity)}
          min="1"
          max={item.soLuongTon}
          disabled={updating}
        />
        <button 
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= item.soLuongTon || updating}
        >
          +
        </button>
      </div>

      <div className="item-total">
        <strong>{formatPrice(item.thanhTien)}</strong>
      </div>

      <div className="item-actions">
        <button 
          onClick={handleRemove}
          className="btn-danger"
          disabled={updating}
        >
          Xóa
        </button>
      </div>
    </div>
  )
}

export default CartItem