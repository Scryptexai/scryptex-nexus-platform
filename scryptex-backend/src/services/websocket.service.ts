
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '@/utils/logger';
import { config } from '@/config/environment';

export interface BridgeStatusUpdate {
  status: string;
  progress: number;
  currentStep: string;
  sourceTxHash?: string;
  targetTxHash?: string;
  error?: string;
}

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userAddress -> socketId

  initialize(httpServer: HTTPServer): void {
    try {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: config.cors.origin,
          methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();
      logger.info('WebSocket service initialized');
    } catch (error) {
      logger.error('Error initializing WebSocket service', { error });
    }
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info('WebSocket client connected', { socketId: socket.id });

      // Handle user authentication
      socket.on('authenticate', (data: { userAddress: string }) => {
        if (data.userAddress) {
          this.connectedUsers.set(data.userAddress, socket.id);
          socket.join(`user:${data.userAddress}`);
          logger.info('User authenticated via WebSocket', { 
            userAddress: data.userAddress, 
            socketId: socket.id 
          });

          socket.emit('authenticated', { success: true });
        }
      });

      // Handle joining specific rooms
      socket.on('join', (room: string) => {
        socket.join(room);
        logger.info('Socket joined room', { socketId: socket.id, room });
      });

      // Handle leaving specific rooms
      socket.on('leave', (room: string) => {
        socket.leave(room);
        logger.info('Socket left room', { socketId: socket.id, room });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from connected users map
        for (const [userAddress, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userAddress);
            break;
          }
        }
        logger.info('WebSocket client disconnected', { socketId: socket.id });
      });

      // Handle ping for connection health check
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  sendToUser(userAddress: string, event: string, data: any): void {
    if (!this.io) return;

    try {
      this.io.to(`user:${userAddress}`).emit(event, data);
      logger.debug('Message sent to user', { userAddress, event });
    } catch (error) {
      logger.error('Error sending message to user', { error, userAddress, event });
    }
  }

  sendToSocket(socketId: string, event: string, data: any): void {
    if (!this.io) return;

    try {
      this.io.to(socketId).emit(event, data);
      logger.debug('Message sent to socket', { socketId, event });
    } catch (error) {
      logger.error('Error sending message to socket', { error, socketId, event });
    }
  }

  broadcast(event: string, data: any): void {
    if (!this.io) return;

    try {
      this.io.emit(event, data);
      logger.debug('Message broadcasted', { event });
    } catch (error) {
      logger.error('Error broadcasting message', { error, event });
    }
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    if (!this.io) return;

    try {
      this.io.to(room).emit(event, data);
      logger.debug('Message sent to room', { room, event });
    } catch (error) {
      logger.error('Error sending message to room', { error, room, event });
    }
  }

  // Bridge-specific events
  emitBridgeStatusUpdate(bridgeId: string, status: BridgeStatusUpdate): void {
    this.broadcast('bridge:status_update', {
      bridgeId,
      ...status,
      timestamp: new Date().toISOString()
    });
  }

  emitBridgeInitiated(userAddress: string, bridgeData: any): void {
    this.sendToUser(userAddress, 'bridge:initiated', {
      ...bridgeData,
      timestamp: new Date().toISOString()
    });
  }

  emitBridgeCompleted(userAddress: string, bridgeData: any): void {
    this.sendToUser(userAddress, 'bridge:completed', {
      ...bridgeData,
      timestamp: new Date().toISOString()
    });
  }

  // Trading-specific events
  emitPriceUpdate(chainId: number, tokenAddress: string, price: string): void {
    this.broadcast('trading:price_update', {
      chainId,
      tokenAddress,
      price,
      timestamp: new Date().toISOString()
    });
  }

  emitNewTrade(tradeData: any): void {
    this.broadcast('trading:new_trade', {
      ...tradeData,
      timestamp: new Date().toISOString()
    });
  }

  // Quest and gaming events
  emitQuestProgress(userAddress: string, questData: any): void {
    this.sendToUser(userAddress, 'quest:progress', {
      ...questData,
      timestamp: new Date().toISOString()
    });
  }

  emitQuestCompleted(userAddress: string, questData: any): void {
    this.sendToUser(userAddress, 'quest:completed', {
      ...questData,
      timestamp: new Date().toISOString()
    });
  }

  emitAchievementUnlocked(userAddress: string, achievementData: any): void {
    this.sendToUser(userAddress, 'achievement:unlocked', {
      ...achievementData,
      timestamp: new Date().toISOString()
    });
  }

  // System events
  emitSystemMaintenance(message: string, startTime: Date, endTime: Date): void {
    this.broadcast('system:maintenance', {
      message,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      timestamp: new Date().toISOString()
    });
  }

  emitSystemAlert(level: 'info' | 'warning' | 'error', message: string): void {
    this.broadcast('system:alert', {
      level,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Connection statistics
  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  isUserConnected(userAddress: string): boolean {
    return this.connectedUsers.has(userAddress);
  }

  disconnectUser(userAddress: string): void {
    const socketId = this.connectedUsers.get(userAddress);
    if (socketId && this.io) {
      this.io.sockets.sockets.get(socketId)?.disconnect();
      this.connectedUsers.delete(userAddress);
      logger.info('User disconnected', { userAddress, socketId });
    }
  }
}
