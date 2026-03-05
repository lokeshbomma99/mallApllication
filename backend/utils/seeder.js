const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { Category, Banner, Review } = require('../models/index');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/supermall';

const categories = [
  { name: 'Fashion', icon: '👗', description: 'Clothing, shoes and accessories' },
  { name: 'Electronics', icon: '📱', description: 'Gadgets and tech products' },
  { name: 'Home & Garden', icon: '🏠', description: 'Furniture and home decor' },
  { name: 'Sports', icon: '⚽', description: 'Sports equipment and activewear' },
  { name: 'Beauty', icon: '💄', description: 'Skincare and cosmetics' },
  { name: 'Books', icon: '📚', description: 'Books, e-books and stationery' },
  { name: 'Toys', icon: '🧸', description: 'Kids toys and games' },
  { name: 'Food', icon: '🍕', description: 'Snacks, groceries and beverages' },
  { name: 'Jewelry', icon: '💍', description: 'Rings, necklaces and watches' },
  { name: 'Automotive', icon: '🚗', description: 'Car accessories and tools' },
];

const banners = [
  { title: 'Mega Sale Up to 70% Off', subtitle: 'Limited time offer on top brands', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop', position: 'hero' },
  { title: 'New Electronics Arrivals', subtitle: 'Latest smartphones and gadgets', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop', position: 'hero' },
  { title: 'Fashion Week Special', subtitle: 'Trending styles at best prices', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop', position: 'middle' },
];

const shopData = [
  { name: 'TechZone Store', category: 'Electronics', description: 'Premium electronics and gadgets at the best prices.' },
  { name: 'Fashion Hub', category: 'Fashion', description: 'Trendy clothing for men, women and kids.' },
  { name: 'HomeDecor Plus', category: 'Home & Garden', description: 'Beautiful home furniture and decor.' },
  { name: 'Sports Arena', category: 'Sports', description: 'All your sporting needs under one roof.' },
  { name: 'Beauty Bliss', category: 'Beauty', description: 'Skincare, makeup and wellness products.' },
];

const productTemplates = [
  // Electronics
  { name: 'iPhone 15 Pro Max Case', category: 'Electronics', price: 599, stock: 150, tags: ['case', 'iphone', 'protection'], description: 'Premium leather case with MagSafe support. Drop-tested up to 6 feet.', loyaltyPoints: 10 },
  { name: 'Wireless Bluetooth Earbuds', category: 'Electronics', price: 1499, salePrice: 999, stock: 80, tags: ['earbuds', 'wireless', 'audio'], description: 'True wireless earbuds with 30hr battery life and active noise cancellation.', loyaltyPoints: 20 },
  { name: 'Fast Charging USB-C Cable', category: 'Electronics', price: 299, stock: 300, tags: ['cable', 'charging', 'usb-c'], description: '100W fast charging cable, 2m length, braided nylon.', loyaltyPoints: 5 },
  { name: 'Smart Watch Series 8', category: 'Electronics', price: 8999, salePrice: 6999, stock: 45, tags: ['smartwatch', 'fitness', 'health'], description: 'Advanced health monitoring with GPS, ECG and blood oxygen sensor.', loyaltyPoints: 100 },
  { name: 'Portable Power Bank 20000mAh', category: 'Electronics', price: 1299, stock: 120, tags: ['powerbank', 'battery', 'portable'], description: 'Ultra-slim 20000mAh power bank with dual fast charging ports.', loyaltyPoints: 15 },
  { name: 'Mechanical Gaming Keyboard', category: 'Electronics', price: 3499, salePrice: 2799, stock: 35, tags: ['keyboard', 'gaming', 'mechanical'], description: 'RGB mechanical keyboard with tactile switches and anti-ghosting.', loyaltyPoints: 40 },

  // Fashion
  { name: 'Classic White Sneakers', category: 'Fashion', price: 1999, salePrice: 1499, stock: 60, tags: ['shoes', 'sneakers', 'casual'], description: 'Timeless white canvas sneakers with cushioned insole. Available in all sizes.', loyaltyPoints: 25 },
  { name: 'Slim Fit Denim Jeans', category: 'Fashion', price: 1299, stock: 90, tags: ['jeans', 'denim', 'casual'], description: 'Premium stretch denim jeans in classic blue wash. Slim fit cut.', loyaltyPoints: 15 },
  { name: 'Oversized Graphic Tee', category: 'Fashion', price: 599, stock: 200, tags: ['tshirt', 'casual', 'unisex'], description: 'Comfortable 100% cotton oversized tee with exclusive graphic print.', loyaltyPoints: 8 },
  { name: 'Floral Summer Dress', category: 'Fashion', price: 1799, salePrice: 1299, stock: 55, tags: ['dress', 'summer', 'floral'], description: 'Light chiffon floral dress perfect for casual summer outings.', loyaltyPoints: 20 },
  { name: 'Leather Crossbody Bag', category: 'Fashion', price: 2499, stock: 40, tags: ['bag', 'leather', 'accessories'], description: 'Genuine leather crossbody bag with multiple compartments.', loyaltyPoints: 30 },
  { name: 'Sports Running Cap', category: 'Fashion', price: 499, stock: 150, tags: ['cap', 'sports', 'running'], description: 'Lightweight moisture-wicking cap with UV protection.', loyaltyPoints: 6 },

  // Home & Garden
  { name: 'Scented Soy Candle Set', category: 'Home & Garden', price: 899, stock: 100, tags: ['candle', 'home', 'decor'], description: 'Set of 3 hand-poured soy wax candles in lavender, vanilla and sandalwood.', loyaltyPoints: 12 },
  { name: 'Bamboo Cutting Board Set', category: 'Home & Garden', price: 799, stock: 75, tags: ['kitchen', 'bamboo', 'cutting board'], description: 'Eco-friendly bamboo cutting boards in 3 sizes with juice grooves.', loyaltyPoints: 10 },
  { name: 'Stainless Steel Water Bottle', category: 'Home & Garden', price: 699, salePrice: 499, stock: 180, tags: ['bottle', 'water', 'eco'], description: 'Double-wall insulated bottle keeps drinks cold 24hrs / hot 12hrs.', loyaltyPoints: 8 },
  { name: 'Indoor Plant Pot Set', category: 'Home & Garden', price: 1199, stock: 65, tags: ['plant', 'pot', 'indoor'], description: 'Set of 5 ceramic plant pots in gradient earth tones with drainage holes.', loyaltyPoints: 15 },

  // Sports
  { name: 'Yoga Mat Premium', category: 'Sports', price: 1499, salePrice: 999, stock: 85, tags: ['yoga', 'mat', 'fitness'], description: 'Extra thick 6mm non-slip yoga mat with carrying strap. Eco-friendly TPE material.', loyaltyPoints: 18 },
  { name: 'Resistance Bands Set', category: 'Sports', price: 599, stock: 200, tags: ['resistance', 'bands', 'workout'], description: 'Set of 5 resistance bands from light to extra-heavy for full body workouts.', loyaltyPoints: 8 },
  { name: 'Adjustable Dumbbell 10kg', category: 'Sports', price: 2999, stock: 30, tags: ['dumbbell', 'weight', 'gym'], description: 'Adjustable cast iron dumbbell with rubber coating. Weight: 5-10kg per dumbbell.', loyaltyPoints: 35 },

  // Beauty
  { name: 'Vitamin C Face Serum', category: 'Beauty', price: 899, stock: 110, tags: ['serum', 'vitamin c', 'skincare'], description: '20% Vitamin C brightening serum with hyaluronic acid. Reduces dark spots in 4 weeks.', loyaltyPoints: 12 },
  { name: 'Rose Clay Face Mask', category: 'Beauty', price: 599, salePrice: 449, stock: 90, tags: ['mask', 'clay', 'skincare'], description: 'Deep cleansing rose clay mask with kaolin. Unclogs pores and brightens skin.', loyaltyPoints: 8 },
  { name: 'Lip Gloss Collection', category: 'Beauty', price: 799, stock: 140, tags: ['lipgloss', 'makeup', 'lips'], description: 'Set of 6 non-sticky lip glosses in trending shades. Long-lasting formula.', loyaltyPoints: 10 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Shop.deleteMany({}), Product.deleteMany({}),
      Category.deleteMany({}), Banner.deleteMany({}), Review.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed Categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Seed Users
    const hashedPw = await bcrypt.hash('password123', 12);
    const adminPw = await bcrypt.hash('admin123', 12);

    const users = await User.insertMany([
      { name: 'Super Admin', email: 'admin@supermall.com', password: adminPw, role: 'admin', loyaltyPoints: 0 },
      { name: 'Rahul Sharma', email: 'shop1@supermall.com', password: hashedPw, role: 'shopowner' },
      { name: 'Priya Patel', email: 'shop2@supermall.com', password: hashedPw, role: 'shopowner' },
      { name: 'Amit Singh', email: 'shop3@supermall.com', password: hashedPw, role: 'shopowner' },
      { name: 'Neha Gupta', email: 'shop4@supermall.com', password: hashedPw, role: 'shopowner' },
      { name: 'Vikas Jain', email: 'shop5@supermall.com', password: hashedPw, role: 'shopowner' },
      { name: 'Ayesha Khan', email: 'customer1@supermall.com', password: hashedPw, role: 'customer', loyaltyPoints: 250 },
      { name: 'Ravi Kumar', email: 'customer2@supermall.com', password: hashedPw, role: 'customer', loyaltyPoints: 120 },
      { name: 'Sneha Mehta', email: 'customer3@supermall.com', password: hashedPw, role: 'customer', loyaltyPoints: 80 },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Seed Shops
    const shopOwners = users.filter(u => u.role === 'shopowner');
    const shops = await Shop.insertMany(
      shopData.map((s, i) => ({
        ...s,
        owner: shopOwners[i]._id,
        status: 'approved',
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        totalReviews: Math.floor(Math.random() * 200) + 20,
        totalSales: Math.floor(Math.random() * 500) + 50,
        totalRevenue: Math.floor(Math.random() * 500000) + 10000,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=2563eb&color=fff&size=128`,
      }))
    );
    console.log(`✅ Created ${shops.length} shops`);

    // Seed Products
    const shopMap = { Electronics: shops[0], Fashion: shops[1], 'Home & Garden': shops[2], Sports: shops[3], Beauty: shops[4] };
    const productImages = {
      Electronics: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
      Fashion: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'],
      'Home & Garden': ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop'],
      Sports: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=400&fit=crop'],
      Beauty: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop'],
    };

    const productsToInsert = productTemplates.map((p, i) => ({
      ...p,
      shop: shopMap[p.category]._id,
      images: productImages[p.category] || [],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      totalReviews: Math.floor(Math.random() * 100) + 5,
      sold: Math.floor(Math.random() * 300) + 10,
      isFeatured: i % 4 === 0,
      flashSale: i % 5 === 0 ? { active: true, discount: 30, endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000) } : { active: false },
    }));

    const products = await Product.insertMany(productsToInsert);
    console.log(`✅ Created ${products.length} products`);

    // Seed Banners
    const admin = users.find(u => u.role === 'admin');
    await Banner.insertMany(banners.map(b => ({ ...b, createdBy: admin._id, isActive: true })));
    console.log(`✅ Created ${banners.length} banners`);

    // Seed Reviews
    const customers = users.filter(u => u.role === 'customer');
    const reviews = [];
    for (let i = 0; i < 30; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const rating = Math.floor(Math.random() * 2) + 4;
      const comments = [
        'Absolutely love this product! Great quality.',
        'Fast delivery and exactly as described.',
        'Good value for money. Would recommend!',
        'Excellent product, very satisfied with purchase.',
        'Quality is top-notch. Will buy again!',
        'Perfect fit and great material.',
        'Exceeded my expectations. 5 stars!',
      ];
      reviews.push({
        product: product._id, customer: customer._id, shop: product.shop,
        rating, comment: comments[Math.floor(Math.random() * comments.length)],
      });
    }
    await Review.insertMany(reviews);
    console.log(`✅ Created ${reviews.length} reviews`);

    console.log('\n🎉 Seeding complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin:      admin@supermall.com     / admin123');
    console.log('🏪 Shop Owner: shop1@supermall.com     / password123');
    console.log('👤 Customer:   customer1@supermall.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder Error:', err.message);
    process.exit(1);
  }
}

seed();
