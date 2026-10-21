require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Student Placement Management System Backend Running`);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Port        : ${PORT}`);
    console.log(` API Base    : http://localhost:${PORT}/api/v1`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
