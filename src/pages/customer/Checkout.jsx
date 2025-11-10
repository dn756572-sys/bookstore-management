import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { orderService } from '../../services/orderService'
import { paymentService } from '../../services/paymentService'
import Layout from '../../components/common/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const onSubmit = async (data) => {
    if (cartItems.length === 0) {
      setError('Giỏ hàng trống')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Create order
      const orderData = {
        ghiChu: data.ghiChu,
        diaChiGiaoHang: data.diaChi
      }

      const order = await orderService.createOrder(orderData)

      // Create payment
      const paymentData = {
        phuongThuc: paymentMethod,
        soTien: getCartTotal()
      }

      await paymentService.createPayment(order.maDH, paymentData)

      // Clear cart
      await clearCart()

      alert('Đặt hàng thành công!')
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container">
          <div className="empty-state">
            <h2>Giỏ hàng trống</h2>
            <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
            <button 
              onClick={() => navigate('/books')}
              className="btn-primary"
            >
              Mua sắm ngay
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="checkout-page">
        <div className="container">
          <h1>Thanh toán</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="checkout-content">
            <form onSubmit={handleSubmit(onSubmit)} className="checkout-form">
              <div className="form-section">
                <h3>Thông tin giao hàng</h3>
                
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    defaultValue={user.hoTen}
                    {...register('hoTen', { required: 'Vui lòng nhập họ tên' })}
                  />
                  {errors.hoTen && <span className="error">{errors.hoTen.message}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="disabled"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    defaultValue={user.soDienThoai}
                    {...register('soDienThoai', { required: 'Vui lòng nhập số điện thoại' })}
                  />
                  {errors.soDienThoai && <span className="error">{errors.soDienThoai.message}</span>}
                </div>

                <div className="form-group">
                  <label>Địa chỉ giao hàng *</label>
                  <textarea
                    rows="3"
                    defaultValue={user.diaChi}
                    {...register('diaChi', { required: 'Vui lòng nhập địa chỉ giao hàng' })}
                  />
                  {errors.diaChi && <span className="error">{errors.diaChi.message}</span>}
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    rows="3"
                    {...register('ghiChu')}
                    placeholder="Ghi chú cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Phương thức thanh toán</h3>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      value="ChuyenKhoan"
                      checked={paymentMethod === 'ChuyenKhoan'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                  
                  <label className="payment-method">
                    <input
                      type="radio"
                      value="ViDienTu"
                      checked={paymentMethod === 'ViDienTu'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Ví điện tử</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary large" disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : 'Đặt hàng'}
              </button>
            </form>

            <div className="order-summary">
              <h3>Đơn hàng của bạn</h3>
              
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.maSach} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.tenSach}</span>
                      <span className="item-quantity">x{item.soLuong}</span>
                    </div>
                    <span className="item-price">{formatPrice(item.thanhTien)}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="total-row final">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Checkout