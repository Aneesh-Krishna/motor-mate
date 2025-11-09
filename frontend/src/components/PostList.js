import React, { useState } from 'react';
import PostCard from './PostCard';
import './PostList.css';

const PostList = ({ posts, onPostUpdated, onPostDeleted, currentUser }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="post-list-empty">
        <h3>No posts found</h3>
        <p>Try adjusting your filters or be the first to share your travel story!</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default PostList;