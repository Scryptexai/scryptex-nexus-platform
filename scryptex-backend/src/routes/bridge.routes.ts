
import { Router } from 'express';
import { BridgeController } from '@/controllers/bridge.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';

const router = Router();
const bridgeController = new BridgeController();

// Public routes (no auth required)
router.get('/chains', bridgeController.getSupportedChains.bind(bridgeController));
router.get('/volume', bridgeController.getBridgeVolume.bind(bridgeController));
router.get('/routes', bridgeController.getBridgeRoutes.bind(bridgeController));

// Protected routes (require authentication)
router.post('/quote', 
  authMiddleware,
  rateLimitMiddleware(10, 60000), // 10 requests per minute
  bridgeController.getQuote.bind(bridgeController)
);

router.post('/execute',
  authMiddleware,
  rateLimitMiddleware(5, 60000), // 5 requests per minute
  bridgeController.executeBridge.bind(bridgeController)
);

router.get('/status/:bridgeId',
  authMiddleware,
  bridgeController.getBridgeStatus.bind(bridgeController)
);

router.get('/history/:userAddress',
  authMiddleware,
  bridgeController.getBridgeHistory.bind(bridgeController)
);

router.post('/fee/estimate',
  authMiddleware,
  rateLimitMiddleware(20, 60000), // 20 requests per minute
  bridgeController.estimateBridgeFee.bind(bridgeController)
);

export { router as bridgeRoutes };
