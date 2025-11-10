import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const BookCard = ({ book, isAdmin = false, onDelete }) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng')
      return
    }

    const result = await addToCart(book.maSach, 1)
    if (result.success) {
      alert('Đã thêm vào giỏ hàng')
    } else {
      alert(result.message)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="book-card">
      <div className="book-image">
        {book.anhBia ? (
          <img src={`http://localhost:5000/uploads/images/${book.anhBia}`} alt={book.tenSach} />
        ) : (
          <div className="book-image-placeholder">📚</div>
        )}
      </div>
      
      <div className="book-info">
        <h3 className="book-title">{book.tenSach}</h3>
        <p className="book-author">Tác giả: {book.tacGia}</p>
        <p className="book-category">Thể loại: {book.theLoai}</p>
        <p className="book-price">{formatPrice(book.giaBan)}</p>
        <p className="book-stock">Tồn kho: {book.soLuongTon}</p>
        
        {book.moTa && (
          <p className="book-description">{book.moTa.substring(0, 100)}...</p>
        )}
      </div>

      <div className="book-actions">
        <Link to={`/books/${book.maSach}`} className="btn-secondary">
          Xem chi tiết
        </Link>
        
        {!isAdmin ? (
          <button 
            onClick={handleAddToCart}
            disabled={book.soLuongTon === 0}
            className={`btn-primary ${book.soLuongTon === 0 ? 'disabled' : ''}`}
          >
            {book.soLuongTon === 0 ? 'Hết hàng' : 'Thêm giỏ hàng'}
          </button>
        ) : (
          <div className="admin-actions">
            <Link to={`/admin/books/edit/${book.maSach}`} className="btn-warning">
              Sửa
            </Link>
            <button onClick={() => onDelete(book.maSach)} className="btn-danger">
              Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookCard