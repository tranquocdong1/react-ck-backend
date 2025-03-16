const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// GET: Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào.' });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm.', error: error.message });
  }
});

// GET: Lấy thông tin chi tiết sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này.' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin sản phẩm.', error: error.message });
  }
});

// GET: Lấy danh sách sản phẩm liên quan theo category
router.get('/related/:category', async (req, res) => {
  try {
    const category = req.params.category;

    // Tìm các sản phẩm cùng category, giới hạn 10 sản phẩm liên quan
    const relatedProducts = await Product.find({ category }).limit(10);

    if (relatedProducts.length === 0) {
      return res.status(404).json({ message: `Không tìm thấy sản phẩm liên quan trong danh mục ${category}.` });
    }

    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(500).json({
      message: `Lỗi server khi tìm sản phẩm liên quan trong danh mục ${req.params.category}.`,
      error: error.message,
    });
  }
});


// POST: Tạo mới một sản phẩm
router.post('/', async (req, res) => {
  try {
    const { productId, name, description, price, category, imageUrls } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!productId || !name || !price) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc: productId, name, hoặc price.' });
    }

    // Kiểm tra xem productId đã tồn tại chưa
    const existingProduct = await Product.findOne({ productId });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product ID đã tồn tại.' });
    }

    const newProduct = new Product({
      productId,
      name,
      description,
      price,
      category,
      imageUrls,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Tạo sản phẩm thành công.', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm.', error: error.message });
  }
});

// PUT: Cập nhật thông tin sản phẩm theo ID
router.put('/:id', async (req, res) => {
  try {
    const { productId, name, description, price, category, imageUrls } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này.' });
    }

    // Nếu cập nhật productId, kiểm tra xem productId mới đã tồn tại chưa
    if (productId && productId !== product.productId) {
      const existingProduct = await Product.findOne({ productId });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product ID mới đã tồn tại.' });
      }
    }

    // Cập nhật các trường
    product.productId = productId || product.productId;
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.imageUrls = imageUrls || product.imageUrls;

    await product.save();
    res.status(200).json({ message: 'Cập nhật sản phẩm thành công.', product });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm.', error: error.message });
  }
});

// DELETE: Xóa sản phẩm theo ID
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này.' });
    }
    res.status(200).json({ message: 'Xóa sản phẩm thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm.', error: error.message });
  }
});

// GET: Tìm kiếm sản phẩm theo danh mục (category)
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    if (products.length === 0) {
      return res.status(404).json({ message: `Không tìm thấy sản phẩm trong danh mục ${req.params.category}.` });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm sản phẩm theo danh mục.', error: error.message });
  }
});

// GET: Tìm kiếm sản phẩm theo từ khóa (name hoặc description)
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } }, // Tìm kiếm không phân biệt hoa thường trong name
        { description: { $regex: keyword, $options: 'i' } }, // Tìm kiếm trong description
      ],
    });
    if (products.length === 0) {
      return res.status(404).json({ message: `Không tìm thấy sản phẩm với từ khóa "${keyword}".` });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm sản phẩm.', error: error.message });
  }
});

module.exports = router;