import app from './src/app.js';
import envConfig from './src/config/env.config.js';
import { connectDatabase } from './src/config/db.config.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(envConfig.PORT, () => {
      console.log(`\n TaskflowAI - Server is running`);
      console.log(`   Environment : ${envConfig.NODE_ENV}`);
      console.log(`   Port        : ${envConfig.PORT}`);
      console.log(`   URL         : http://localhost:${envConfig.PORT}`);
      console.log(`   Health      : http://localhost:${envConfig.PORT}/api/v1/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
