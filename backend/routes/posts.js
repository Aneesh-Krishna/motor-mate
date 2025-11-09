const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);

// Protected routes
router.post('/', auth, postController.createPost);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);
router.post('/:id/like', auth, postController.likePost);
router.post('/:id/dislike', auth, postController.dislikePost);
router.post('/:id/report', auth, postController.reportPost);
router.get('/my/posts', auth, postController.getMyPosts);

module.exports = router;