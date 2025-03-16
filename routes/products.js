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

// GET: Lấy danh sách sản phẩm mới
router.get('/home/new-products', async (req, res) => {
  try {
    // Lấy tối đa 8 sản phẩm mới nhất dựa vào ngày tạo
    const newProducts = await Product.find({ isNewProduct: true })
      .sort({ createdAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
      .limit(8);
    
    if (newProducts.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm mới.' });
    }
    
    res.status(200).json(newProducts);
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi lấy danh sách sản phẩm mới.', 
      error: error.message 
    });
  }
});

// GET: Lấy danh sách sản phẩm best seller
router.get('/home/best-sellers', async (req, res) => {
  try {
    // Lấy tối đa 8 sản phẩm có lượng bán cao nhất
    const bestSellers = await Product.find({ isBestSeller: true })
      .sort({ salesCount: -1 }) // Sắp xếp theo số lượng bán từ cao đến thấp
      .limit(8);
    
    if (bestSellers.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm best seller.' });
    }
    
    res.status(200).json(bestSellers);
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi lấy danh sách sản phẩm best seller.', 
      error: error.message 
    });
  }
});

// PUT: Cập nhật trạng thái best seller cho sản phẩm
router.put('/:id/set-bestseller', async (req, res) => {
  try {
    const { isBestSeller } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này.' });
    }
    
    product.isBestSeller = isBestSeller;
    await product.save();
    
    res.status(200).json({ 
      message: `Đã ${isBestSeller ? 'đặt' : 'hủy'} trạng thái best seller cho sản phẩm.`, 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật trạng thái best seller.', 
      error: error.message 
    });
  }
});

// PUT: Cập nhật trạng thái sản phẩm mới
router.put('/:id/set-new-product', async (req, res) => {
  try {
    const { isNewProduct } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này.' });
    }
    
    product.isNewProduct = isNewProduct;
    await product.save();
    
    res.status(200).json({ 
      message: `Đã ${isNewProduct ? 'đặt' : 'hủy'} trạng thái sản phẩm mới.`, 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật trạng thái sản phẩm mới.', 
      error: error.message 
    });
  }
});

// PUT: Cập nhật số lượng bán cho sản phẩm
router.put('/:id/update-sales', async (req, res) => {
  try {
    const { salesCount } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với ID này.' });
    }
    
    product.salesCount = salesCount;
    // Tự động đánh dấu là best seller nếu số lượng bán vượt ngưỡng (ví dụ: 100)
    if (salesCount > 100) {
      product.isBestSeller = true;
    }
    
    await product.save();
    
    res.status(200).json({ 
      message: 'Đã cập nhật số lượng bán cho sản phẩm.', 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật số lượng bán.', 
      error: error.message 
    });
  }
});

// GET: Lấy cả sản phẩm mới và best seller cho trang home
router.get('/home/featured', async (req, res) => {
  try {
    // Lấy song song cả 2 loại sản phẩm
    const [newProducts, bestSellers] = await Promise.all([
      Product.find({ isNewProduct: true })
        .sort({ createdAt: -1 })
        .limit(8),
      Product.find({ isBestSeller: true })
        .sort({ salesCount: -1 })
        .limit(8)
    ]);
    
    res.status(200).json({
      newProducts,
      bestSellers
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi server khi lấy dữ liệu trang chủ.', 
      error: error.message 
    });
  }
});


// POST: Tạo mới một sản phẩm
router.post('/', async (req, res) => {
  try {
    const { 
      productId, name, description, price, category, imageUrls,
      isNewProduct = true,
      isBestSeller = false,
      salesCount = 0 
    } = req.body;

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
      isNewProduct,
      isBestSeller,
      salesCount,
      createdAt: new Date()
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