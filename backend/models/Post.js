const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      required: true,
      enum: ['unrelated_content', 'hate_speech', 'violence', 'adult_content', 'spam', 'other']
    },
    description: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  linkedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v) || v === '';
      },
      message: 'Invalid image URL format'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
PostSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Index for sorting
PostSchema.index({ createdAt: -1 });
PostSchema.index({ updatedAt: -1 });


// Update the updatedAt field on save
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Update likes and dislikes counts
  this.likesCount = this.likes.length;
  this.dislikesCount = this.dislikes.length;

  next();
});

// Ensure user hasn't already liked/disliked the post
PostSchema.methods.hasUserLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

PostSchema.methods.hasUserDisliked = function(userId) {
  return this.dislikes.some(dislike => dislike.user.toString() === userId.toString());
};

PostSchema.methods.hasUserReported = function(userId) {
  return this.reports.some(report => report.reportedBy.toString() === userId.toString());
};

module.exports = mongoose.model('Post', PostSchema);