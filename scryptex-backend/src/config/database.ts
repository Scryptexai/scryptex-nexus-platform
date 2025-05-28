
import { Sequelize } from 'sequelize';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  public sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize(config.database.url, {
      dialect: config.database.dialect,
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      username: config.database.user,
      password: config.database.password,
      logging: config.database.logging,
      pool: config.database.pool,
      dialectOptions: {
        ssl: config.database.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      },
      hooks: {
        beforeConnect: () => {
          logger.debug('Attempting to connect to database...');
        },
        afterConnect: () => {
          logger.debug('Database connection established');
        },
        beforeDisconnect: () => {
          logger.debug('Disconnecting from database...');
        },
        afterDisconnect: () => {
          logger.debug('Database connection closed');
        }
      }
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      logger.info('Database connection has been established successfully');
      
      // Sync models in development
      if (config.env === 'development') {
        await this.sequelize.sync({ alter: true });
        logger.info('Database models synchronized');
      }
    } catch (error) {
      logger.error('Unable to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.sequelize.close();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }
}

export const databaseConnection = DatabaseConnection.getInstance();
export const sequelize = databaseConnection.getSequelize();
