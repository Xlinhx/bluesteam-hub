import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/errors.js';

export interface CreateServerAppOptions {
  databaseUrl?: string;
  mediaStorageDir?: string;
  port?: number;
  host?: string;
}

export async function createServerApp(options: CreateServerAppOptions = {}) {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.register({
      databaseUrl: options.databaseUrl,
      mediaStorageDir: options.mediaStorageDir,
    }),
    {
      logger: ['error', 'warn'],
    },
  );

  app.useBodyParser('json', { limit: '15mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '15mb' });

  const rawCors = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:3010';
  const configuredOrigins = rawCors
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (
        configuredOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        )
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port =
    options.port !== undefined
      ? options.port
      : Number(process.env.PORT || process.env.API_PORT || 8010);
  const host = options.host || process.env.HOST || '127.0.0.1';

  await app.listen(port, host);
  const httpServer = app.getHttpServer();
  const address = httpServer.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  const url = `http://127.0.0.1:${actualPort}`;

  return {
    app,
    url,
    port: actualPort,
    close: async () => {
      await app.close();
    },
  };
}
