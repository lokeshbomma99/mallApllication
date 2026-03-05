const Product = require('../models/Product');
const User = require('../models/User');

// @GET /api/products — with search, filter, pagination
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12, shop, flashSale } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (shop) query.shop = shop;
    if (flashSale === 'true') query['flashSale.active'] = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      popular: { sold: -1 },
      rating: { rating: -1 },
    };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).populate('shop', 'name logo').sort(sortOptions[sort] || { createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop', 'name logo rating');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/products — shop owner
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, shop: req.body.shopId });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { 'flashSale.active': fsActive, 'flashSale.discount': fsDiscount, ...rest } = req.body;
    const updateData = { ...rest };
    if (rest.flashSale === undefined && (fsActive !== undefined || fsDiscount !== undefined)) {
      updateData.flashSale = {
        active: fsActive ?? false,
        discount: fsDiscount ?? 0,
        endsAt: fsActive ? new Date(Date.now() + 3 * 60 * 60 * 1000) : null,
      };
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: false });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/:id/recommendations — AI-style: same category, similar tags
const getRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    const recommendations = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
      ],
    }).limit(8).populate('shop', 'name logo');

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/products/:id/view — track recently viewed
const trackView = async (req, res) => {
  try {
    if (!req.user) return res.sendStatus(204);
    const userId = req.user._id;
    const productId = req.params.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { recentlyViewed: productId },
    });
    await User.findByIdAndUpdate(userId, {
      $push: { recentlyViewed: { $each: [productId], $position: 0, $slice: 20 } },
    });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/recently-viewed
const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyViewed',
      match: { isActive: true },
      options: { limit: 10 },
      populate: { path: 'shop', select: 'name logo' },
    });
    res.json(user.recentlyViewed || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getRecommendations, trackView, getRecentlyViewed };
