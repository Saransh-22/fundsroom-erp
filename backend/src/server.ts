import app from './app';
import { config } from './config/env';
import { checkDatabaseConnection } from './config/database';

const startServer = async () => {
  const isDbConnected = await checkDatabaseConnection();
  if (!isDbConnected) {
    console.error('FATAL: Unable to connect to PostgreSQL database. Exiting process.');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Fundsroom API server running on port ${config.port} [${config.nodeEnv}]`);
  });
};

startServer();
