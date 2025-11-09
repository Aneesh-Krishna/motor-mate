const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, linkedTrip, images } = req.body;

    const post = new Post({
      title,
      content,
      author: req.user.id,
      tags: tags || [],
      linkedTrip: linkedTrip && linkedTrip.trim() ? linkedTrip : undefined,
      images: images || []
    });

    await post.save();

    // Fetch the post with populated author data
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username email firstName lastName avatar')
      .populate('linkedTrip', 'title destination startDate');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: 'Server error while creating post',
      details: error.message
    });
  }
};

// Get all posts with filtering and sorting
exports.getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      tags,
      author,
      minLength,
      maxLength
    } = req.query;

    // Build query
    const query = {
      isApproved: true,
      isHidden: false
    };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Filter by author
    if (author) {
      // Search by username or email prefix
      const authorUsers = await User.find({
        $or: [
          { username: { $regex: author, $options: 'i' } },
          { email: { $regex: `^${author}@`, $options: 'i' } }
        ]
      }).select('_id');

      query.author = { $in: authorUsers.map(u => u._id) };
    }

    // Filter by content length
    if (minLength || maxLength) {
      const lengthQuery = {};
      if (minLength) lengthQuery.$gte = parseInt(minLength);
      if (maxLength) lengthQuery.$lte = parseInt(maxLength);
      query.$expr = {
        $and: Object.keys(lengthQuery).map(key => ({
          [`$strLenCP`]: ['$content', lengthQuery[key]]
        }))
      };
    }

    // Build sort object
    let sortOptions = { createdAt: -1 }; // Default to newest

    if (sort === 'new' || sort === 'createdAt') {
      sortOptions = { createdAt: order === 'asc' ? 1 : -1 };
    } else if (sort === 'old') {
      sortOptions = { createdAt: order === 'desc' ? 1 : -1 };
    } else if (sort === 'short' || sort === 'contentLength') {
      // Sort by content length (shortest first)
      const posts = await Post.aggregate([
        { $match: query },
        { $addFields: { contentLength: { $strLenCP: ['$content'] } } },
        { $sort: { contentLength: order === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit * 1 },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $project: { username: 1, email: 1, firstName: 1, lastName: 1, avatar: 1 } }
            ]
          }
        },
        { $unwind: '$author' },
        {
          $lookup: {
            from: 'trips',
            localField: 'linkedTrip',
            foreignField: '_id',
            as: 'linkedTrip',
            pipeline: [
              { $project: { title: 1, destination: 1, startDate: 1 } }
            ]
          }
        },
        { $unwind: { path: '$linkedTrip', preserveNullAndEmptyArrays: true } }
      ]);

      const total = await Post.countDocuments(query);

      return res.json({
        posts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } else if (sort === 'long') {
      // Sort by content length (longest first)
      const posts = await Post.aggregate([
        { $match: query },
        { $addFields: { contentLength: { $strLenCP: ['$content'] } } },
        { $sort: { contentLength: order === 'desc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit * 1 },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
            pipeline: [
              { $project: { username: 1, email: 1, firstName: 1, lastName: 1, avatar: 1 } }
            ]
          }
        },
        { $unwind: '$author' },
        {
          $lookup: {
            from: 'trips',
            localField: 'linkedTrip',
            foreignField: '_id',
            as: 'linkedTrip',
            pipeline: [
              { $project: { title: 1, destination: 1, startDate: 1 } }
            ]
          }
        },
        { $unwind: { path: '$linkedTrip', preserveNullAndEmptyArrays: true } }
      ]);

      const total = await Post.countDocuments(query);

      return res.json({
        posts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } else if (sort === 'likes') {
      // Sort by likes count using aggregation
      sortOptions = { likesCount: order === 'desc' ? -1 : 1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'username email firstName lastName avatar')
      .populate('linkedTrip', 'title destination startDate')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email firstName lastName avatar')
      .populate('linkedTrip', 'title destination startDate')
      .populate('reports.reportedBy', 'username email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.isHidden || !post.isApproved) {
      return res.status(403).json({ message: 'Post not available' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, tags, linkedTrip, images } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.linkedTrip = linkedTrip && linkedTrip.trim() ? linkedTrip : post.linkedTrip;
    post.images = images || post.images;

    await post.save();
    await post.populate('author', 'username email firstName lastName avatar');
    await post.populate('linkedTrip', 'title destination startDate');

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already liked
    if (post.hasUserLiked(req.user.id)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }

    // Remove dislike if exists
    post.dislikes = post.dislikes.filter(
      dislike => dislike.user.toString() !== req.user.id
    );

    // Add like
    post.likes.push({ user: req.user.id });
    await post.save();

    res.json({ message: 'Post liked successfully', likes: post.likes, dislikes: post.dislikes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already disliked
    if (post.hasUserDisliked(req.user.id)) {
      return res.status(400).json({ message: 'You have already disliked this post' });
    }

    // Remove like if exists
    post.likes = post.likes.filter(
      like => like.user.toString() !== req.user.id
    );

    // Add dislike
    post.dislikes.push({ user: req.user.id });
    await post.save();

    res.json({ message: 'Post disliked successfully', likes: post.likes, dislikes: post.dislikes });
  } catch (error) {
    console.error('Error disliking post:', error);
    res.status(500).json({ message: 'Server error while disliking post' });
  }
};

// Report a post
exports.reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already reported
    if (post.hasUserReported(req.user.id)) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    // Add report
    post.reports.push({
      reportedBy: req.user.id,
      reason,
      description
    });

    // Hide post if it has more than 5 reports
    if (post.reports.length >= 5) {
      post.isHidden = true;
    }

    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Server error while reporting post' });
  }
};

// Get posts by current user
exports.getMyPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'username email firstName lastName avatar')
      .populate('linkedTrip', 'title destination startDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments({ author: req.user.id });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ message: 'Server error while fetching your posts' });
  }
};