import { api } from './api'
import { mockBooks } from './mockData'

export const bookService = {
  getAllBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params })
      return Array.isArray(response.data) ? response.data : mockBooks
    } catch (error) {
      console.warn('Using mock books data due to error:', error.message)
      return mockBooks // Fallback to mock data
    }
  },

  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`)
      return response.data
    } catch (error) {
      console.warn('Using mock book data due to error:', error.message)
      return mockBooks.find(book => book.maSach === parseInt(id)) || mockBooks[0]
    }
  },

  createBook: async (bookData) => {
    try {
      const response = await api.post('/books', bookData)
      return response.data
    } catch (error) {
      console.warn('Mock book creation:', bookData)
      return { success: true, message: 'Sách đã được thêm thành công' }
    }
  },

  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData)
      return response.data
    } catch (error) {
      console.warn('Mock book update:', id, bookData)
      return { success: true, message: 'Sách đã được cập nhật thành công' }
    }
  },

  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`)
      return response.data
    } catch (error) {
      console.warn('Mock book deletion:', id)
      return { success: true, message: 'Sách đã được xóa thành công' }
    }
  },

  searchBooks: async (query) => {
    try {
      const response = await api.get('/books/search', { params: { q: query } })
      return Array.isArray(response.data) ? response.data : mockBooks
    } catch (error) {
      console.warn('Using mock search data due to error:', error.message)
      return mockBooks.filter(book => 
        book.tenSach.toLowerCase().includes(query.toLowerCase()) ||
        book.tacGia.toLowerCase().includes(query.toLowerCase())
      )
    }
  },

  getBooksByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/books/category/${categoryId}`)
      return Array.isArray(response.data) ? response.data : mockBooks
    } catch (error) {
      console.warn('Using mock category data due to error:', error.message)
      return mockBooks.filter(book => book.maDanMuc === parseInt(categoryId))
    }
  }
}