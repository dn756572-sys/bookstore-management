import React from 'react'
import { Link } from 'react-router-dom'

const CategoryCard = ({ category, onDelete }) => {
  return (
    <div className="category-card">
      <div className="category-info">
        <h3 className="category-name">{category.tenDanMuc}</h3>
        {category.moTa && (
          <p className="category-description">{category.moTa}</p>
        )}
      </div>

      <div className="category-actions">
        <Link 
          to={`/admin/categories/edit/${category.maDanMuc}`}
          className="btn-warning"
        >
          Sửa
        </Link>
        <button 
          onClick={() => onDelete(category.maDanMuc)}
          className="btn-danger"
        >
          Xóa
        </button>
      </div>
    </div>
  )
}

export default CategoryCard