const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const cors = require('cors');

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:3000' })); // Cho phép frontend truy cập
app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));