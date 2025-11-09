import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      tags: '',
      author: '',
      sort: 'new',
      minLength: '',
      maxLength: ''
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="search-filter">
      <div className="filter-header">
        <h3>Search & Filter</h3>
        <button
          className="toggle-filter"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="filter-form">
          <div className="form-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={localFilters.search}
              onChange={handleChange}
              placeholder="Search in title, content, tags..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={localFilters.tags}
              onChange={handleChange}
              placeholder="travel, adventure, road-trip"
            />
            <small>Comma separated tags</small>
          </div>

          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              id="author"
              name="author"
              value={localFilters.author}
              onChange={handleChange}
              placeholder="Username or email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              name="sort"
              value={localFilters.sort}
              onChange={handleChange}
            >
              <option value="new">Newest First</option>
              <option value="old">Oldest First</option>
              <option value="short">Shortest First</option>
              <option value="long">Longest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="minLength">Min Length</label>
              <input
                type="number"
                id="minLength"
                name="minLength"
                value={localFilters.minLength}
                onChange={handleChange}
                placeholder="50"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxLength">Max Length</label>
              <input
                type="number"
                id="maxLength"
                name="maxLength"
                value={localFilters.maxLength}
                onChange={handleChange}
                placeholder="1000"
                min="0"
              />
            </div>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              onClick={handleReset}
              className="reset-btn"
            >
              Reset
            </button>
            <button
              type="submit"
              className="apply-btn"
            >
              Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SearchFilter;