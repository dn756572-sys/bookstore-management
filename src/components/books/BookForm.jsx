import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { bookService } from '../../services/bookService'
import { categoryService } from '../../services/categoryService'
import LoadingSpinner from '../common/LoadingSpinner'

const BookForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, setValue } = useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [image, setImage] = useState(null)

  const isEdit = Boolean(id)

  useEffect(() => {
    loadCategories()
    if (isEdit) {
      loadBook()
    }
  }, [id])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data)
    } catch (err) {
      setError('Lỗi tải danh mục')
    }
  }

  const loadBook = async () => {
    try {
      const book = await bookService.getBookById(id)
      Object.keys(book).forEach(key => {
        setValue(key, book[key])
      })
    } catch (err) {
      setError('Lỗi tải thông tin sách')
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (key === 'giaBan' || key === 'soLuongTon') {
          formData.append(key, Number(data[key]))
        } else if (data[key]) {
          formData.append(key, data[key])
        }
      })

      if (image) {
        formData.append('anhBia', image)
      }

      if (isEdit) {
        await bookService.updateBook(id, formData)
        alert('Cập nhật sách thành công')
      } else {
        await bookService.createBook(formData)
        alert('Thêm sách thành công')
      }

      navigate('/admin/books')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi lưu sách')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
    }
  }

  return (
    <div className="form-container">
      <h2>{isEdit ? 'Sửa thông tin sách' : 'Thêm sách mới'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="book-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tên sách *</label>
            <input
              type="text"
              {...register('tenSach', { required: 'Vui lòng nhập tên sách' })}
            />
            {errors.tenSach && <span className="error">{errors.tenSach.message}</span>}
          </div>

          <div className="form-group">
            <label>Tác giả *</label>
            <input
              type="text"
              {...register('tacGia', { required: 'Vui lòng nhập tên tác giả' })}
            />
            {errors.tacGia && <span className="error">{errors.tacGia.message}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Thể loại</label>
            <input
              type="text"
              {...register('theLoai')}
            />
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select {...register('maDanMuc')}>
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.maDanMuc} value={cat.maDanMuc}>
                  {cat.tenDanMuc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Giá bán *</label>
            <input
              type="number"
              step="0.01"
              {...register('giaBan', { 
                required: 'Vui lòng nhập giá bán',
                min: { value: 0, message: 'Giá bán phải lớn hơn 0' }
              })}
            />
            {errors.giaBan && <span className="error">{errors.giaBan.message}</span>}
          </div>

          <div className="form-group">
            <label>Số lượng tồn *</label>
            <input
              type="number"
              {...register('soLuongTon', { 
                required: 'Vui lòng nhập số lượng',
                min: { value: 0, message: 'Số lượng không được âm' }
              })}
            />
            {errors.soLuongTon && <span className="error">{errors.soLuongTon.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            rows="4"
            {...register('moTa')}
          />
        </div>

        <div className="form-group">
          <label>Ảnh bìa</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/books')}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookForm