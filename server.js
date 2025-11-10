require('dotenv').config();
const { connectDB } = require('./src/config/database');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Starting BookStore Backend Server...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔗 Database:', process.env.DB_DATABASE || 'BookStoreManagement');
    
    // Connect to database first
    await connectDB();
    
    // Start server after database connection
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Base: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();