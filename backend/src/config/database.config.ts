import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI');
  const user = configService.get<string>('MONGODB_USER');
  const pass = configService.get<string>('MONGODB_PASSWORD');

  const options: MongooseModuleOptions = {
    uri,
    auth: user && pass ? { username: user, password: pass } : undefined,
    retryAttempts: 5,
    retryDelay: 1000,
    connectionFactory: (connection) => {
      connection.on('connected', () => {
        console.log('MongoDB connected successfully');
      });
      connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
      connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
      return connection;
    },
  };

  return options;
};
