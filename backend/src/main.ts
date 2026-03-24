import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { matchMaker, Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom, RoomState } from './game/game.room';
import { BadRequestException, Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { UserService } from './user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ChannelsService } from './channel/channel.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = {};
        
        // Log only the validation errors without sensitive data
        const sanitizedErrors = errors.map(error => ({
          property: error.property,
          constraints: error.constraints,
          value: error.value ? '[REDACTED]' : undefined
        }));
        console.log('Validation errors:', sanitizedErrors);
        
        errors.forEach(error => {
          formattedErrors[error.property] = Object.values(error.constraints);
        });
        
        // 🔴 Throw an exception so NestJS can return the response properly
        throw new BadRequestException({
          message: 'eroare de validare',
          errors: formattedErrors
        });
      },
    }),
  );
  app.use(cookieParser());


  const allowedOrigins = (config.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const isOriginAllowed = (origin?: string): boolean => {
    if (!origin) return true;
    return allowedOrigins.includes(origin);
  };

  logger.log("Allowed CORS origins: " + process.env.CORS_ORIGINS);
  app.enableCors({
    origin: (origin, callback) => {
      // allow non-browser clients / same-origin server calls
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const server = createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({ 
      server,
      verifyClient: (info, callback) => {
        const origin = info.origin;
        if (isOriginAllowed(origin)) {
          callback(true);
        } else {
          callback(false, 403, 'Not allowed by CORS');
        }
      }
    })
  });  
  
  matchMaker.controller.getCorsHeaders = function (request) {
    const requestOrigin = request.headers.origin as string | undefined;
    const allowOrigin = isOriginAllowed(requestOrigin)
      ? (requestOrigin || '*')
      : 'null';

    return {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    };
  }

  const userService = app.get(UserService);
  const jwtService = app.get(JwtService);
  const channelsService = app.get(ChannelsService);

  // 👇 Inject services into static properties
  GameRoom.userService = userService;
  GameRoom.jwtService = jwtService;
  GameRoom.channelsService = channelsService;
  // gameServer.define('game_room', GameRoom);
  // gameServer.define('game_room2', GameRoom)
  gameServer.define('channel', GameRoom).filterBy(["channelId"])

  app.setGlobalPrefix('api');
  
  await gameServer.listen(2567);
  await app.listen(3000);
}
bootstrap();
