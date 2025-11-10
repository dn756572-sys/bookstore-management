import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { categoryService } from '../../services/categoryService'
import LoadingSpinner from '../common/LoadingSpinner'

const CategoryForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      loadCategory()
    }
  }, [id])

  const loadCategory = async () => {
    try {
      const category = await categoryService.getCategoryById(id)
      setValue('tenDanMuc', category.tenDanMuc)
      setValue('moTa', category.moTa)
    } catch (err) {
      setError('Lỗi tải thông tin danh mục')
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      if (isEdit) {
        await categoryService.updateCategory(id, data)
        alert('Cập nhật danh mục thành công')
      } else {
        await categoryService.createCategory(data)
        alert('Thêm danh mục thành công')
      }

      navigate('/admin/categories')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu danh mục')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>{isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="category-form">
        <div className="form-group">
          <label>Tên danh mục *</label>
          <input
            type="text"
            {...register('tenDanMuc', { required: 'Vui lòng nhập tên danh mục' })}
          />
          {errors.tenDanMuc && <span className="error">{errors.tenDanMuc.message}</span>}
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            rows="4"
            {...register('moTa')}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/categories')}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm