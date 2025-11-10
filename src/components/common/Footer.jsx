import React from 'react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>BookStore</h3>
            <p>Hệ thống quản lý nhà sách chuyên nghiệp</p>
          </div>
          
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>Email: contact@bookstore.com</p>
            <p>Điện thoại: 0123-456-789</p>
          </div>
          
          <div className="footer-section">
            <h4>Địa chỉ</h4>
            <p>123 Đường Sách, Quận 1, TP.HCM</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 BookStore Management. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer