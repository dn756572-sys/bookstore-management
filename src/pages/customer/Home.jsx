import React from 'react'
import Layout from '../../components/common/Layout'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <Layout>
      <div className="home-page">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>Chào mừng đến với BookStore</h1>
              <p>Khám phá thế giới tri thức với hàng ngàn đầu sách đa dạng</p>
              <Link to="/books" className="btn-primary large">
                Mua sắm ngay
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2>Tại sao chọn BookStore?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Giao hàng miễn phí</h3>
                <p>Miễn phí vận chuyển cho đơn hàng từ 200.000đ</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Thanh toán an toàn</h3>
                <p>Đa dạng phương thức thanh toán bảo mật</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📞</div>
                <h3>Hỗ trợ 24/7</h3>
                <p>Đội ngũ hỗ trợ khách hàng luôn sẵn sàng</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Home