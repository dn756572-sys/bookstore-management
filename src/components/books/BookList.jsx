import React, { useState, useEffect, useRef } from 'react'
import { bookService } from '../../services/bookService'
import BookCard from './BookCard'
import BookFilter from './BookFilter'
import Pagination from '../common/Pagination'
import LoadingSpinner from '../common/LoadingSpinner'

const BookList = ({ isAdmin = false, categoryId = null }) => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    sort: 'tenSach'
  })
  const [pagination, setPagination] = useState({})
  const [loadAttempts, setLoadAttempts] = useState(0)
  const lastRequestRef = useRef()

  const loadBooks = async () => {
    // Cancel previous request if still pending
    if (lastRequestRef.current) {
      // You could add cancellation logic here if using axios CancelToken
    }

    try {
      setLoading(true)
      const params = { ...filters }
      if (categoryId) params.category = categoryId
      
      const response = await bookService.getAllBooks(params)
      
      const booksData = Array.isArray(response) 
        ? response 
        : Array.isArray(response.data) 
          ? response.data 
          : Array.isArray(response.books) 
            ? response.books 
            : []
      
      setBooks(booksData)
      setPagination(response.pagination || {})
      setLoadAttempts(0)
    } catch (err) {
      console.error('Error loading books:', err)
      setError('Lỗi tải danh sách sách')
      setLoadAttempts(prev => prev + 1)
      
      // Auto-retry after 3 seconds for rate limiting
      if (err.response?.status === 429 && loadAttempts < 3) {
        setTimeout(loadBooks, 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [filters, categoryId])

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 })
  }

  const handlePageChange = (page) => {
    setFilters({ ...filters, page })
  }

  const handleRetry = () => {
    setLoadAttempts(0)
    loadBooks()
  }

  if (loading && loadAttempts === 0) {
    return <LoadingSpinner text="Đang tải sách..." />
  }

  if (error && loadAttempts >= 3) {
    return (
      <LoadingSpinner 
        text="Không thể tải danh sách sách" 
        showRetry={true}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <div className="book-list-container">
      <BookFilter filters={filters} onFilterChange={handleFilterChange} />
      
      {error && loadAttempts < 3 && (
        <div className="warning-message">
          {error} - Đang thử lại... ({loadAttempts}/3)
        </div>
      )}
      
      {error && loadAttempts >= 3 && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="book-grid">
        {Array.isArray(books) && books.map(book => (
          <BookCard 
            key={book.maSach} 
            book={book} 
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {(!Array.isArray(books) || books.length === 0) && !loading && (
        <div className="empty-state">
          <p>Không tìm thấy sách nào</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

export default BookList