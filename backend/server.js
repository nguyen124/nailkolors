require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const technicianRoutes = require('./routes/technicians');
const colorRoutes = require('./routes/colors');
const appointmentRoutes = require('./routes/appointments');
const postRoutes = require('./routes/posts');
const analyticsRoutes = require('./routes/analytics');
const salonOwnerRoutes = require('./routes/salon-owners');
const mySalonRoutes = require('./routes/my-salon');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:4200' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
app.use('/api/salon-owners', salonOwnerRoutes);
app.use('/api/my-salon', mySalonRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nailkolors')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
