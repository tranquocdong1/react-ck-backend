const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart.productId');
  res.json(user.cart);
});

router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user.id);
  user.cart.push({ productId, quantity });
  await user.save();
  res.json(user.cart);
});

module.exports = router;