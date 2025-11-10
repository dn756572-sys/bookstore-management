import React, { useState } from 'react'

const DevBanner = () => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="dev-banner">
      <div className="dev-banner-content">
        <span className="dev-banner-text">
          🚧 Đang sử dụng dữ liệu mẫu để phát triển frontend
        </span>
        <button 
          onClick={() => setIsVisible(false)}
          className="dev-banner-close"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default DevBanner