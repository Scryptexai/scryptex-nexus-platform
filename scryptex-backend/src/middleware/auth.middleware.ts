
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import { User } from '@/models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    address: string;
    username?: string;
    isVerified: boolean;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, config.security.jwtSecret) as any;
      
      // Find user in database
      const user = await User.findOne({
        where: { walletAddress: decoded.address }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        address: user.walletAddress,
        username: user.username,
        isVerified: user.isVerified
      };

      next();

    } catch (jwtError) {
      logger.warn('Invalid JWT token', { error: jwtError, token: token.substring(0, 20) + '...' });
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

  } catch (error) {
    logger.error('Auth middleware error', { error });
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.security.jwtSecret) as any;
      
      const user = await User.findOne({
        where: { walletAddress: decoded.address }
      });

      if (user) {
        req.user = {
          id: user.id,
          address: user.walletAddress,
          username: user.username,
          isVerified: user.isVerified
        };
      }

    } catch (jwtError) {
      // Invalid token, continue without user
      logger.debug('Invalid optional auth token', { error: jwtError });
    }

    next();

  } catch (error) {
    logger.error('Optional auth middleware error', { error });
    next(); // Continue without auth on error
  }
};

export const verifyWalletSignature = async (
  message: string,
  signature: string,
  address: string
): Promise<boolean> => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error('Error verifying wallet signature', { error, address });
    return false;
  }
};

export const generateAuthToken = (address: string): string => {
  return jwt.sign(
    { 
      address,
      timestamp: Date.now()
    },
    config.security.jwtSecret,
    { 
      expiresIn: config.security.jwtExpire,
      issuer: 'scryptex-backend',
      audience: 'scryptex-frontend'
    }
  );
};

export const requireRole = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // For now, we'll implement basic role checking
    // In production, you'd want to store roles in the database
    const userRole = req.user.isVerified ? 'verified' : 'user';
    
    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

export const requireVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Account verification required'
    });
    return;
  }

  next();
};
