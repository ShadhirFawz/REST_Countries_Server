// server.js
import app from './app.js';
import connectDB from './config/db.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
