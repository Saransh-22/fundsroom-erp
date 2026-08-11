import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { checkDatabaseConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import challanRoutes from './routes/challanRoutes';
import { errorHandler } from './middleware/error';

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
  })
);
app.use(express.json());

app.get('/api/health', async (req: Request, res: Response) => {
  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Fundsroom ERP API service is running',
      database: 'connected',
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'error',
      message: 'API is running but database is disconnected',
      database: 'disconnected',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api', productRoutes);
app.use('/api/challans', challanRoutes);

app.use(errorHandler);

export default app;
