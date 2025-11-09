import React, { useState } from 'react';
import './PostCard.css';

const PostCard = ({ post, onPostUpdated, onPostDeleted, currentUser }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [reportData, setReportData] = useState({
    reason: 'other',
    description: ''
  });
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  const getAuthorUsername = (author) => {
    if (!author) return 'Anonymous';
    return author.username || author.email?.split('@')[0] || 'Anonymous';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.ceil(diffTime / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      setError('Please log in to like posts');
      return;
    }

    const actionKey = 'like';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like post');
      }

      const data = await response.json();
      onPostUpdated({
        ...post,
        likes: data.likes,
        dislikes: data.dislikes
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      setError('Please log in to dislike posts');
      return;
    }

    const actionKey = 'dislike';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to dislike post');
      }

      const data = await response.json();
      onPostUpdated({
        ...post,
        likes: data.likes,
        dislikes: data.dislikes
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleReport = async () => {
    if (!currentUser) {
      setError('Please log in to report posts');
      return;
    }

    const actionKey = 'report';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report post');
      }

      setShowReportModal(false);
      setReportData({ reason: 'other', description: '' });
      alert('Post reported successfully. Our team will review it.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const actionKey = 'delete';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      onPostDeleted(post._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const isAuthor = currentUser && post.author && post.author._id === currentUser.id;

  return (
    <div className="post-card">
      {error && (
        <div className="post-error">
          {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      <div className="post-header">
        <div className="author-info">
          {post.author?.avatar && (
            <img
              src={post.author.avatar}
              alt={getAuthorUsername(post.author)}
              className="author-avatar"
            />
          )}
          <div className="author-details">
            <h4 className="author-name">{getAuthorUsername(post.author)}</h4>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="post-actions">
          <button
            onClick={() => setShowReportModal(true)}
            className="report-btn"
            title="Report post"
          >
            ⚠️
          </button>
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="delete-btn"
              title="Delete post"
              disabled={actionLoading.delete}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="post-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="post-footer">
        <div className="engagement-buttons">
          <button
            onClick={handleLike}
            className={`like-btn ${post.likes && Array.isArray(post.likes) && post.likes.some(like => like.user === currentUser?.id) ? 'liked' : ''}`}
            disabled={actionLoading.like}
          >
            👍 {post.likes?.length || 0}
          </button>

          <button
            onClick={handleDislike}
            className={`dislike-btn ${post.dislikes && Array.isArray(post.dislikes) && post.dislikes.some(dislike => dislike.user === currentUser?.id) ? 'disliked' : ''}`}
            disabled={actionLoading.dislike}
          >
            👎 {post.dislikes?.length || 0}
          </button>
        </div>

        {post.linkedTrip && (
          <div className="linked-trip">
            📍 Linked to trip
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Report Post</h3>
            <div className="form-group">
              <label>Reason for reporting:</label>
              <select
                value={reportData.reason}
                onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
              >
                <option value="unrelated_content">Unrelated Content</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="violence">Violence</option>
                <option value="adult_content">Adult Content</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description (optional):</label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                placeholder="Please provide more details..."
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowReportModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="submit-btn"
                disabled={actionLoading.report}
              >
                {actionLoading.report ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;