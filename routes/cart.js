const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router(); // Khởi tạo router

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.productId', 'name price imageUrls');
    const cartMap = new Map();
    user.cart.forEach(item => {
      if (item.productId) {
        const key = item.productId._id.toString();
        if (cartMap.has(key)) {
          cartMap.get(key).quantity += item.quantity;
        } else {
          cartMap.set(key, { 
            _id: item._id, 
            productId: item.productId, 
            quantity: item.quantity 
          });
        }
      }
    });
    const uniqueCart = Array.from(cartMap.values());
    user.cart = uniqueCart.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity
    }));
    await user.save();
    res.json(uniqueCart || []);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const existingItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity += quantity || 1;
    } else {
      user.cart.push({ productId, quantity: quantity || 1 });
    }
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.productId', 'name price imageUrls');
    res.json(updatedUser.cart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/remove', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.productId', 'name price imageUrls');
    res.json(updatedUser.cart);
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;