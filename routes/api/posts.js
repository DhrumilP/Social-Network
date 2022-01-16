const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/profile');
const User = require('../../models/user');
const Post = require('../../models/Post');

// @route   POST api/posts
// @desc    Test route
// @access  Public
router.post(
  '/',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const allPosts = await Post.find().sort({ date: -1 });
    res.json(allPosts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    Get one post
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).send('User not authorized');
    }
    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (
      post.likes.filter(like => like.user.toString() == req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (
      post.likes.filter(like => like.user.toString() == req.user.id).length == 0
    ) {
      return res.status(400).json({ msg: 'Post has not been liked' });
    }
    const ind = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(ind, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on the post
// @access  Private
router.post(
  '/comment/:id',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(newComment);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/comment/:post_id/:comment_id
// @desc    delete a comment
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    const comment_index = post.comments
      .map(comment => comment.id.toString())
      .indexOf(req.params.comment_id);

    console.log(comment_index);

    if (comment_index == null) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    if (
      post.comments[comment_index].user.toString() !== req.user.id.toString()
    ) {
      return res.status(401).send('User not authorized');
    }

    post.comments.splice(comment_index, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
