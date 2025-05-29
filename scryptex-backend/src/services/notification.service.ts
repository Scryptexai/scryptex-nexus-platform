
import { logger } from '@/utils/logger';
import { WebSocketService } from './websocket.service';

export interface NotificationData {
  bridgeId?: string;
  fromChain?: number;
  toChain?: number;
  amount?: string;
  txHash?: string;
  status?: string;
  message?: string;
}

export class NotificationService {
  private websocketService: WebSocketService;

  constructor() {
    this.websocketService = new WebSocketService();
  }

  async sendBridgeInitiated(userAddress: string, data: NotificationData): Promise<void> {
    try {
      const notification = {
        type: 'bridge_initiated',
        title: 'Bridge Transaction Started',
        message: `Bridge transaction initiated from chain ${data.fromChain} to ${data.toChain}`,
        data,
        timestamp: new Date().toISOString()
      };

      // Send WebSocket notification
      this.websocketService.sendToUser(userAddress, 'bridge:initiated', notification);

      // Log notification
      logger.info('Bridge initiated notification sent', { userAddress, data });

    } catch (error) {
      logger.error('Error sending bridge initiated notification', { error, userAddress, data });
    }
  }

  async sendBridgeCompleted(userAddress: string, data: NotificationData): Promise<void> {
    try {
      const notification = {
        type: 'bridge_completed',
        title: 'Bridge Transaction Completed',
        message: `Bridge transaction completed successfully`,
        data,
        timestamp: new Date().toISOString()
      };

      this.websocketService.sendToUser(userAddress, 'bridge:completed', notification);
      logger.info('Bridge completed notification sent', { userAddress, data });

    } catch (error) {
      logger.error('Error sending bridge completed notification', { error, userAddress, data });
    }
  }

  async sendBridgeFailed(userAddress: string, data: NotificationData): Promise<void> {
    try {
      const notification = {
        type: 'bridge_failed',
        title: 'Bridge Transaction Failed',
        message: `Bridge transaction failed: ${data.message || 'Unknown error'}`,
        data,
        timestamp: new Date().toISOString()
      };

      this.websocketService.sendToUser(userAddress, 'bridge:failed', notification);
      logger.info('Bridge failed notification sent', { userAddress, data });

    } catch (error) {
      logger.error('Error sending bridge failed notification', { error, userAddress, data });
    }
  }

  async sendQuestCompleted(userAddress: string, questData: any): Promise<void> {
    try {
      const notification = {
        type: 'quest_completed',
        title: 'Quest Completed!',
        message: `Congratulations! You completed the quest: ${questData.title}`,
        data: questData,
        timestamp: new Date().toISOString()
      };

      this.websocketService.sendToUser(userAddress, 'quest:completed', notification);
      logger.info('Quest completed notification sent', { userAddress, questData });

    } catch (error) {
      logger.error('Error sending quest completed notification', { error, userAddress, questData });
    }
  }

  async sendAchievementUnlocked(userAddress: string, achievementData: any): Promise<void> {
    try {
      const notification = {
        type: 'achievement_unlocked',
        title: 'Achievement Unlocked!',
        message: `You unlocked a new achievement: ${achievementData.name}`,
        data: achievementData,
        timestamp: new Date().toISOString()
      };

      this.websocketService.sendToUser(userAddress, 'achievement:unlocked', notification);
      logger.info('Achievement unlocked notification sent', { userAddress, achievementData });

    } catch (error) {
      logger.error('Error sending achievement unlocked notification', { error, userAddress, achievementData });
    }
  }

  async sendGenericNotification(
    userAddress: string, 
    type: string, 
    title: string, 
    message: string, 
    data?: any
  ): Promise<void> {
    try {
      const notification = {
        type,
        title,
        message,
        data: data || {},
        timestamp: new Date().toISOString()
      };

      this.websocketService.sendToUser(userAddress, `notification:${type}`, notification);
      logger.info('Generic notification sent', { userAddress, type, title });

    } catch (error) {
      logger.error('Error sending generic notification', { error, userAddress, type, title });
    }
  }

  async broadcastSystemNotification(title: string, message: string, data?: any): Promise<void> {
    try {
      const notification = {
        type: 'system_notification',
        title,
        message,
        data: data || {},
        timestamp: new Date().toISOString()
      };

      this.websocketService.broadcast('system:notification', notification);
      logger.info('System notification broadcasted', { title, message });

    } catch (error) {
      logger.error('Error broadcasting system notification', { error, title, message });
    }
  }
}
