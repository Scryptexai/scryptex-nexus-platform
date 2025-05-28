
import { createClient, RedisClientType } from 'redis';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

class RedisConnection {
  private static instance: RedisConnection;
  public client: RedisClientType;
  public subscriber: RedisClientType;
  public publisher: RedisClientType;
  public jobQueue: RedisClientType;

  private constructor() {
    // Main Redis client
    this.client = createClient({
      url: config.redis.url,
      password: config.redis.password,
      database: config.redis.db,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 10000,
        lazyConnect: true
      }
    });

    // Subscriber client for pub/sub
    this.subscriber = createClient({
      url: config.redis.url,
      password: config.redis.password,
      database: config.redis.db,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 10000,
        lazyConnect: true
      }
    });

    // Publisher client for pub/sub
    this.publisher = createClient({
      url: config.redis.url,
      password: config.redis.password,
      database: config.redis.db,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 10000,
        lazyConnect: true
      }
    });

    // Job queue client
    this.jobQueue = createClient({
      url: config.redis.url,
      password: config.redis.password,
      database: config.redis.jobQueueDb,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 10000,
        lazyConnect: true
      }
    });

    this.setupEventHandlers();
  }

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }

  private setupEventHandlers(): void {
    // Main client events
    this.client.on('connect', () => logger.debug('Redis main client connecting...'));
    this.client.on('ready', () => logger.info('Redis main client ready'));
    this.client.on('error', (err) => logger.error('Redis main client error:', err));
    this.client.on('end', () => logger.info('Redis main client connection closed'));

    // Subscriber events
    this.subscriber.on('connect', () => logger.debug('Redis subscriber connecting...'));
    this.subscriber.on('ready', () => logger.info('Redis subscriber ready'));
    this.subscriber.on('error', (err) => logger.error('Redis subscriber error:', err));

    // Publisher events
    this.publisher.on('connect', () => logger.debug('Redis publisher connecting...'));
    this.publisher.on('ready', () => logger.info('Redis publisher ready'));
    this.publisher.on('error', (err) => logger.error('Redis publisher error:', err));

    // Job queue events
    this.jobQueue.on('connect', () => logger.debug('Redis job queue connecting...'));
    this.jobQueue.on('ready', () => logger.info('Redis job queue ready'));
    this.jobQueue.on('error', (err) => logger.error('Redis job queue error:', err));
  }

  public async connect(): Promise<void> {
    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
        this.jobQueue.connect()
      ]);
      logger.info('All Redis connections established successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await Promise.all([
        this.client.quit(),
        this.subscriber.quit(),
        this.publisher.quit(),
        this.jobQueue.quit()
      ]);
      logger.info('All Redis connections closed');
    } catch (error) {
      logger.error('Error closing Redis connections:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cache utility methods
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  public async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  // Pub/Sub methods
  public async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.publisher.publish(channel, message);
    } catch (error) {
      logger.error(`Redis PUBLISH error for channel ${channel}:`, error);
      return 0;
    }
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel, callback);
    } catch (error) {
      logger.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }

  public async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      logger.error(`Redis UNSUBSCRIBE error for channel ${channel}:`, error);
      throw error;
    }
  }
}

export const redisConnection = RedisConnection.getInstance();

// Cache key generators
export const cacheKeys = {
  tokenPrice: (chainId: number, address: string) => `prices:token:${chainId}:${address}`,
  chainPrices: (chainId: number) => `prices:chain:${chainId}`,
  userProfile: (address: string) => `user:profile:${address}`,
  userBalances: (address: string) => `user:balances:${address}`,
  bridgeRoutes: (fromChain: number, toChain: number) => `bridge:routes:${fromChain}:${toChain}`,
  bridgeStatus: (txHash: string) => `bridge:status:${txHash}`,
  farmingMetrics: (address: string) => `farming:metrics:${address}`,
  platformStats: () => 'platform:stats:global',
  tradingPair: (tokenA: string, tokenB: string, chainId: number) => `trading:pair:${chainId}:${tokenA}:${tokenB}`,
  liquidityPool: (poolId: string) => `liquidity:pool:${poolId}`,
  questProgress: (address: string, questId: string) => `quest:progress:${address}:${questId}`,
  communityData: (communityId: string) => `community:${communityId}`,
  governanceProposal: (proposalId: string) => `governance:proposal:${proposalId}`
};

// Connect to Redis
export async function connectRedis(): Promise<void> {
  await redisConnection.connect();
}

// Disconnect from Redis
export async function disconnectRedis(): Promise<void> {
  await redisConnection.disconnect();
}
