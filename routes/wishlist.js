const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');
  res.json(user.wishlist);
});

router.post('/add', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }
  res.json(user.wishlist);
});

router.delete('/remove', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user.id);
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  res.json(user.wishlist);
});

module.exports = router;