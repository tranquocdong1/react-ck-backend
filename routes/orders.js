/* This code snippet is defining routes for handling orders in a Node.js application using Express
framework. Here's a breakdown of what the code is doing: */

// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');
// const authMiddleware = require('../middleware/auth');

// // Lấy danh sách đơn hàng của người dùng
// router.get('/', authMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user.id }).populate('products.productId');
//     res.json(orders);
//   } catch (error) {
//     console.error('Lỗi khi lấy đơn hàng:', error);
//     res.status(500).json({ message: 'Lỗi server' });
//   }
// });

// // Tạo đơn hàng mới
// router.post('/', authMiddleware, async (req, res) => {
//   try {
//     const { products, total } = req.body;
//     const order = new Order({
//       userId: req.user.id,
//       products,
//       total,
//       createdAt: new Date(),
//     });
//     await order.save();
//     res.status(201).json(order);
//   } catch (error) {
//     console.error('Lỗi khi tạo đơn hàng:', error);
//     res.status(500).json({ message: 'Lỗi server' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// Lấy danh sách đơn hàng của người dùng
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('items.productId');
    res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo đơn hàng mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      city,
      postcode,
      country,
      paymentMethod,
      items,
      subtotal,
      shippingFee,
      totalPrice,
    } = req.body;

    const order = new Order({
      userId: req.user.id,
      fullName,
      email,
      phone,
      address,
      city,
      postcode,
      country,
      paymentMethod,
      items,
      subtotal,
      shippingFee,
      totalPrice,
      status: 'pending',
      createdAt: new Date(),
    });

    await order.save();
    res.status(201).json({ message: 'Tạo đơn hàng thành công', order });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;