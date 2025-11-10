import React from 'react'
import Layout from '../../components/common/Layout'
import BookDetail from '../../components/books/BookDetail'

const BookDetailPage = () => {
  return (
    <Layout>
      <div className="book-detail-page">
        <div className="container">
          <BookDetail />
        </div>
      </div>
    </Layout>
  )
}

export default BookDetailPage