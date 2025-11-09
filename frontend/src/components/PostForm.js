import React, { useState } from 'react';
import './PostForm.css';

const PostForm = ({ onPostCreated, onCancel, initialPost = null }) => {
  const [formData, setFormData] = useState({
    title: initialPost?.title || '',
    content: initialPost?.content || '',
    tags: initialPost?.tags?.join(', ') || '',
    linkedTrip: initialPost?.linkedTrip || '',
    images: initialPost?.images?.join('\n') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('You must be logged in to create posts');
      }

      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: formData.images.split('\n').map(img => img.trim()).filter(img => img)
      };

      const url = initialPost
        ? `http://localhost:5000/api/posts/${initialPost._id}`
        : 'http://localhost:5000/api/posts';

      const response = await fetch(url, {
        method: initialPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You are not authorized to perform this action.');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save post');
        }
      }

      const savedPost = await response.json();
      onPostCreated(savedPost);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form">
      <h3>{initialPost ? 'Edit Post' : 'Create New Post'}</h3>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength="200"
            placeholder="Give your post a catchy title..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            maxLength="5000"
            rows="8"
            placeholder="Share your travel story, tips, or experiences..."
          />
          <div className="character-count">
            {formData.content.length}/5000 characters
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="travel, adventure, road-trip, tips (comma separated)"
          />
          <small>Separate tags with commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="linkedTrip">Linked Trip ID (Optional)</label>
          <input
            type="text"
            id="linkedTrip"
            name="linkedTrip"
            value={formData.linkedTrip}
            onChange={handleChange}
            placeholder="Trip ID if this post is related to a specific trip"
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Image URLs (Optional)</label>
          <textarea
            id="images"
            name="images"
            value={formData.images}
            onChange={handleChange}
            rows="3"
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          />
          <small>Enter one URL per line</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
          >
            {loading ? 'Saving...' : (initialPost ? 'Update Post' : 'Publish Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;