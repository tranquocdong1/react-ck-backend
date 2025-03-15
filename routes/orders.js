const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).populate('products.productId');
  res.json(orders);
});

router.post('/', authMiddleware, async (req, res) => {
  const { products, total } = req.body;
  const order = new Order({ userId: req.user.id, products, total });
  await order.save();
  res.json(order);
});

module.exports = router;