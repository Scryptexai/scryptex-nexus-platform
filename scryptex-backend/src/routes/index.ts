
import { Router } from 'express';
import { bridgeRoutes } from './bridge.routes';
// Import other route modules when they exist
// import { authRoutes } from './auth.routes';
// import { tradingRoutes } from './trading.routes';
// import { questRoutes } from './quest.routes';
// import { analyticsRoutes } from './analytics.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SCRYPTEX Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount route modules
router.use('/bridge', bridgeRoutes);
// router.use('/auth', authRoutes);
// router.use('/trading', tradingRoutes);
// router.use('/quest', questRoutes);
// router.use('/analytics', analyticsRoutes);

export { router as apiRoutes };
