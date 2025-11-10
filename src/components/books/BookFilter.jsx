import React, { useState, useEffect } from 'react'
import { categoryService } from '../../services/categoryService'

const BookFilter = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState([])
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    onFilterChange(localFilters)
  }

  return (
    <div className="book-filter">
      <form onSubmit={handleSearch} className="filter-form">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={localFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.maDanMuc} value={cat.maDanMuc}>
                {cat.tenDanMuc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={localFilters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="tenSach">Sắp xếp theo tên</option>
            <option value="giaBan_asc">Giá thấp đến cao</option>
            <option value="giaBan_desc">Giá cao đến thấp</option>
            <option value="soLuongTon">Số lượng tồn</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Tìm kiếm
        </button>
      </form>
    </div>
  )
}

export default BookFilter