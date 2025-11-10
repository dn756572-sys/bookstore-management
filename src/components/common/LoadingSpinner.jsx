import React from 'react'

const LoadingSpinner = ({ size = 'medium', text = 'Đang tải...', showRetry = false, onRetry }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
      {showRetry && (
        <button onClick={onRetry} className="btn-primary">
          Thử lại
        </button>
      )}
    </div>
  )
}

export default LoadingSpinner