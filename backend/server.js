const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS — allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/shops',         require('./routes/shopRoutes'));
app.use('/api/products',      require('./routes/productRoutes'));
app.use('/api/orders',        require('./routes/orderRoutes'));
app.use('/api/cart',          require('./routes/cartRoutes'));
app.use('/api/wishlist',      require('./routes/wishlistRoutes'));
app.use('/api/reviews',       require('./routes/reviewRoutes'));
app.use('/api/coupons',       require('./routes/couponRoutes'));
app.use('/api/chat',          require('./routes/chatRoutes'));
app.use('/api/categories',    require('./routes/categoryRoutes'));
app.use('/api/banners',       require('./routes/bannerRoutes'));
app.use('/api/returns',       require('./routes/returnRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'SuperMall API Running' }));

// Socket.IO — real-time chat & notifications
io.on('connection', (socket) => {
  console.log('🟢 Connected:', socket.id);

  socket.on('join_room', (roomId) => socket.join(roomId));

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('order_update', (data) => {
    io.to(data.userId).emit('order_notification', data);
  });

  socket.on('disconnect', () => console.log('🔴 Disconnected:', socket.id));
});

// Export io for use in controllers
global.io = io;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/supermall')
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server on http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('❌ DB Error:', err));