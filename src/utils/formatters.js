/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format number with thousands separator
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('vi-VN').format(number)
}

/**
 * Format percentage
 */
export const formatPercentage = (value, total) => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1)}%`
}

/**
 * Format time ago
 */
export const timeAgo = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} năm trước`
}

/**
 * Format ISBN number
 */
export const formatISBN = (isbn) => {
  if (!isbn) return ''
  // Basic ISBN formatting - can be enhanced based on requirements
  return isbn.replace(/(\d{3})(\d{1,5})(\d{1,7})(\d{1,6})(\d{1})/, '$1-$2-$3-$4-$5')
}

/**
 * Format book reference
 */
export const formatBookReference = (book) => {
  if (!book) return ''
  return `${book.tenSach} - ${book.tacGia} (${book.namXuatBan || 'N/A'})`
}

/**
 * Format order reference
 */
export const formatOrderReference = (order) => {
  if (!order) return ''
  return `ĐH#${order.maDH} - ${new Date(order.ngayDat).toLocaleDateString('vi-VN')}`
}

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return 'Chưa có địa chỉ'
  return address
}