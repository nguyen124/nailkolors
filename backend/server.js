require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const technicianRoutes = require('./routes/technicians');
const colorRoutes = require('./routes/colors');
const appointmentRoutes = require('./routes/appointments');
const postRoutes = require('./routes/posts');
const analyticsRoutes = require('./routes/analytics');
const addOnRoutes = require('./routes/addons');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const server = http.createServer(app);

// In production (Cloud Run), frontend is served from the same origin — no CORS needed.
// In development, allow localhost:4200.
const corsOrigin = process.env.CLIENT_URL || 'http://localhost:4200';
const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] }
});

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
// In production, redirect /uploads/* to GCS public bucket
if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', (req, res) => {
    res.redirect(301, `https://storage.googleapis.com/nailkolors-uploads${req.path}`);
  });
} else {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-technician', (technicianId) => {
    socket.join(`technician-${technicianId}`);
    console.log(`Technician ${technicianId} joined their room`);
  });
  socket.on('join-admin', () => {
    socket.join('admin-room');
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/addons', addOnRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Serve Angular frontend in production
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nailkolors')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
