import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { bookService } from '../../services/bookService'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

const BookDetail = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    loadBook()
  }, [id])

  const loadBook = async () => {
    try {
      const bookData = await bookService.getBookById(id)
      setBook(bookData)
    } catch (err) {
      setError('Lỗi tải thông tin sách')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng')
      return
    }

    const result = await addToCart(book.maSach, quantity)
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

  if (loading) return <LoadingSpinner text="Đang tải thông tin sách..." />
  if (error) return <div className="error-message">{error}</div>
  if (!book) return <div className="error-message">Không tìm thấy sách</div>

  return (
    <div className="book-detail">
      <div className="book-detail-content">
        <div className="book-detail-image">
          {book.anhBia ? (
            <img src={`http://localhost:5000/uploads/images/${book.anhBia}`} alt={book.tenSach} />
          ) : (
            <div className="book-image-placeholder large">📚</div>
          )}
        </div>

        <div className="book-detail-info">
          <h1 className="book-title">{book.tenSach}</h1>
          <p className="book-author"><strong>Tác giả:</strong> {book.tacGia}</p>
          <p className="book-category"><strong>Thể loại:</strong> {book.theLoai}</p>
          <p className="book-price"><strong>Giá:</strong> {formatPrice(book.giaBan)}</p>
          <p className="book-stock"><strong>Tồn kho:</strong> {book.soLuongTon}</p>

          {book.moTa && (
            <div className="book-description">
              <h3>Mô tả</h3>
              <p>{book.moTa}</p>
            </div>
          )}

          <div className="book-actions">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <input
                type="number"
                min="1"
                max={book.soLuongTon}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={book.soLuongTon === 0}
              className={`btn-primary large ${book.soLuongTon === 0 ? 'disabled' : ''}`}
            >
              {book.soLuongTon === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>

            <Link to="/books" className="btn-secondary">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail