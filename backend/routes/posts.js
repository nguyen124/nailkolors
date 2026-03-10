const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: 'uploads/posts/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true }).sort({ publishDate: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/posts/${req.file.filename}`;
    const post = new Post(data);
    await post.save();
    res.status(201).json(post);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/posts/${req.file.filename}`;
    const post = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(post);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
