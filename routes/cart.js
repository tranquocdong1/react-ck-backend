const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Lấy giỏ hàng
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
    res.json(uniqueCart);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/add', authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const existingItem = user.cart.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    await user.populate('cart.productId', 'name price imageUrls');
    res.json(user.cart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Xóa một sản phẩm khỏi giỏ hàng
router.delete('/remove', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();
    await user.populate('cart.productId', 'name price imageUrls');
    res.json(user.cart);
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    console.log('Clear cart API called by user:', req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();
    console.log('Cart cleared for user:', user._id);
    res.json({ message: 'Giỏ hàng đã được xóa' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
