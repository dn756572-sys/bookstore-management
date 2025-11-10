import React from 'react'
import Layout from '../../components/common/Layout'
import BookList from '../../components/books/BookList'

const BooksPage = () => {
  return (
    <Layout>
      <div className="books-page">
        <div className="container">
          <div className="page-header">
            <h1>Danh sách Sách</h1>
            <p>Khám phá bộ sưu tập sách đa dạng của chúng tôi</p>
          </div>
          <BookList />
        </div>
      </div>
    </Layout>
  )
}

export default BooksPage