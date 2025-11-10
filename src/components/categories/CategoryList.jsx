import React, { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'
import CategoryCard from './CategoryCard'
import LoadingSpinner from '../common/LoadingSpinner'

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Lỗi tải danh sách danh mục')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await categoryService.deleteCategory(categoryId)
        loadCategories()
      } catch (err) {
        setError('Lỗi xóa danh mục')
      }
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải danh mục..." />

  return (
    <div className="category-list">
      <div className="page-header">
        <h1>Quản lý Danh mục</h1>
        <button 
          className="btn-primary"
          onClick={() => window.location.href = '/admin/categories/new'}
        >
          Thêm danh mục
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="category-grid">
        {Array.isArray(categories) && categories.map(category => (
          <CategoryCard 
            key={category.maDanMuc} 
            category={category}
            onDelete={handleDeleteCategory}
          />
        ))}
      </div>

      {(!Array.isArray(categories) || categories.length === 0) && !loading && (
        <div className="empty-state">
          <p>Chưa có danh mục nào</p>
        </div>
      )}
    </div>
  )
}

export default CategoryList