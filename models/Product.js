const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  imageUrls: [String],
  createdAt: { type: Date, default: Date.now }, // Để lấy sản phẩm mới
  isNewProduct: { type: Boolean, default: true }, // Đánh dấu là sản phẩm mới
  isBestSeller: { type: Boolean, default: false }, // Đánh dấu là best seller
  salesCount: { type: Number, default: 0 }, // Đếm số lượng bán ra
  rating: { type: Number, default: 0 }, // Đánh giá sao (nếu cần)
});

module.exports = mongoose.model('Product', productSchema);