require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const listingRoutes = require('./src/routes/listing.routes');
const wishlistRoutes = require('./src/routes/wishlist.routes');
const chatRoutes = require('./src/routes/chat.routes');
const reviewRoutes = require('./src/routes/review.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const reportRoutes = require('./src/routes/report.routes');
const adminRoutes = require('./src/routes/admin.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/socket');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:8000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Express now attaches to a plain http server (instead of calling
// app.listen() directly) so Socket.io can share the same port — the one
// structural change to existing code; everything else is additive.
const httpServer = http.createServer(app);
initSocket(httpServer, allowedOrigins);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => console.log(`[server] CampusKart API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  });
