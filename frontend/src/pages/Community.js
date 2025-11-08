import React, { useState, useEffect } from 'react';
import './Community.css';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import SearchFilter from '../components/SearchFilter';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    tags: '',
    author: '',
    sort: 'new',
    minLength: '',
    maxLength: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const fetchPosts = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        sort: newFilters.sort,
        order: 'desc'
      });

      // Add filters to query params
      if (newFilters.search) queryParams.append('search', newFilters.search);
      if (newFilters.tags) queryParams.append('tags', newFilters.tags);
      if (newFilters.author) queryParams.append('author', newFilters.author);
      if (newFilters.minLength) queryParams.append('minLength', newFilters.minLength);
      if (newFilters.maxLength) queryParams.append('maxLength', newFilters.maxLength);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:5000/api/posts?${queryParams}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchPosts(1, newFilters);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowPostForm(false);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post =>
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(posts.filter(post => post._id !== deletedPostId));
  };

  const handlePageChange = (page) => {
    fetchPosts(page);
  };

  const getUser = () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const user = getUser();

  return (
    <div className="community-page">
      <div className="community-header">
        <h1>Community Hub</h1>
        <p>Share your trip stories and connect with fellow travelers</p>
      </div>

      <div className="community-content">
        <div className="community-sidebar">
          <div className="create-post-section">
            {localStorage.getItem('token') ? (
              <>
                <button
                  className="create-post-btn"
                  onClick={() => setShowPostForm(!showPostForm)}
                >
                  {showPostForm ? 'Cancel' : '+ Create New Post'}
                </button>

                {showPostForm && (
                  <PostForm
                    onPostCreated={handlePostCreated}
                    onCancel={() => setShowPostForm(false)}
                  />
                )}
              </>
            ) : (
              <div className="auth-required">
                <p>Please log in to create posts</p>
              </div>
            )}
          </div>

          <SearchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="community-main">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading posts...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={() => fetchPosts()}>Try Again</button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="posts-header">
                <h2>{pagination.total} Posts</h2>
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {posts.length === 0 ? (
                <div className="no-posts">
                  <h3>No posts found</h3>
                  <p>Be the first to share your travel story!</p>
                </div>
              ) : (
                <PostList
                  posts={posts}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                  currentUser={user}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;