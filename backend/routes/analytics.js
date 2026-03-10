const express = require('express');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Technician = require('../models/Technician');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // Today's appointments
    const todayAppts = await Appointment.find({
      date: { $gte: today, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    }).populate('serviceId', 'name price');

    // Weekly appointments
    const weeklyAppts = await Appointment.find({
      date: { $gte: weekStart, $lte: todayEnd },
      status: { $ne: 'cancelled' }
    });

    // Daily revenue estimate
    const dailyRevenue = todayAppts.reduce((sum, appt) => {
      return sum + (appt.serviceId?.price || 0);
    }, 0);

    // Most popular services
    const servicePipeline = [
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$serviceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $project: { name: '$service.name', count: 1 } }
    ];
    const popularServices = await Appointment.aggregate(servicePipeline);

    // Technician performance
    const techPipeline = [
      { $match: { status: 'completed' } },
      { $group: { _id: '$technicianId', completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $lookup: { from: 'technicians', localField: '_id', foreignField: '_id', as: 'technician' } },
      { $unwind: '$technician' },
      { $project: { name: '$technician.name', completed: 1 } }
    ];
    const techPerformance = await Appointment.aggregate(techPipeline);

    // Most used nail colors
    const colorPipeline = [
      { $match: { nailColorId: { $ne: null }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$nailColorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'nailcolors', localField: '_id', foreignField: '_id', as: 'color' } },
      { $unwind: '$color' },
      { $project: { colorName: '$color.colorName', brand: '$color.brand', colorCode: '$color.colorCode', count: 1 } }
    ];
    const popularColors = await Appointment.aggregate(colorPipeline);

    res.json({
      todayTotal: todayAppts.length,
      weeklyTotal: weeklyAppts.length,
      dailyRevenue,
      popularServices,
      techPerformance,
      popularColors
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
