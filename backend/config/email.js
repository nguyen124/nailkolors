const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationEmail = async (appointment, service, technician) => {
  const dateStr = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e8c;">Appointment Confirmed - Nail Kolors</h2>
      <p>Dear ${appointment.customerName},</p>
      <p>Your appointment has been confirmed!</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${service.name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Technician</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${technician.name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dateStr}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${appointment.time}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Price</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${service.price}</td></tr>
      </table>
      <p>To view or cancel your appointment, use your email: <strong>${appointment.customerEmail}</strong> or phone: <strong>${appointment.customerPhone}</strong></p>
      <p style="color: #999; font-size: 12px;">Nail Kolors Salon</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Nail Kolors" <${process.env.EMAIL_USER}>`,
      to: appointment.customerEmail,
      subject: 'Appointment Confirmed - Nail Kolors',
      html: customerHtml
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

module.exports = { sendConfirmationEmail };
