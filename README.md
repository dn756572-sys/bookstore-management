# BookStore Management System

Hệ thống quản lý nhà sách toàn diện với giao diện người dùng hiện đại và dễ sử dụng.

## Tính năng

### Quản trị viên
- **Dashboard**: Tổng quan doanh thu, đơn hàng, sách và khách hàng
- **Quản lý Sách**: Thêm, sửa, xóa, tìm kiếm sách
- **Quản lý Danh mục**: Quản lý danh mục sách
- **Quản lý Khách hàng**: Xem thông tin và lịch sử mua hàng
- **Quản lý Nhân viên**: Quản lý tài khoản nhân viên
- **Quản lý Đơn hàng**: Xử lý và cập nhật trạng thái đơn hàng

### Khách hàng
- **Mua sắm**: Duyệt và tìm kiếm sách
- **Giỏ hàng**: Thêm sản phẩm vào giỏ hàng
- **Thanh toán**: Đặt hàng với nhiều phương thức thanh toán
- **Tài khoản**: Quản lý thông tin cá nhân
- **Lịch sử**: Theo dõi đơn hàng đã đặt

## Công nghệ sử dụng

### Frontend
- **React 18**: Thư viện UI hiện đại
- **React Router DOM**: Điều hướng single-page application
- **React Hook Form**: Quản lý form với validation
- **React Query**: Quản lý server state
- **Axios**: HTTP client cho API calls
- **CSS3**: Styling với CSS Variables và Grid/Flexbox

### Backend (Node.js/Express)
- **RESTful API**: Kiến trúc API chuẩn REST
- **JWT Authentication**: Xác thực token-based
- **SQL Server**: Cơ sở dữ liệu quan hệ
- **File Upload**: Xử lý upload ảnh sách

## Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn
- Backend server chạy trên port 5000

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd bookstore-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev