import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import LoadingSpinner from '../common/LoadingSpinner'

const OrderForm = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      // Order creation is typically handled through cart/checkout process
      // This form might be for admin to create manual orders
      navigate('/admin/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tạo đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Tạo đơn hàng mới</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="order-form">
        <div className="form-group">
          <label>Mã khách hàng *</label>
          <input
            type="number"
            {...register('maKH', { required: 'Vui lòng nhập mã khách hàng' })}
          />
          {errors.maKH && <span className="error">{errors.maKH.message}</span>}
        </div>

        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            rows="3"
            {...register('ghiChu')}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : 'Tạo đơn hàng'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/orders')}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  )
}

export default OrderForm