import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/books?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Tìm kiếm sách..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-btn">
        🔍
      </button>
    </form>
  )
}

export default SearchBar