import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import { StringValue } from 'ms';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Foi feito assim, pois o JwtModule precisa acessar a variável de ambiente 
    // JWT_SECRET para configurar a chave secreta do JWT, e isso é feito 
    // usando o ConfigService. O método registerAsync permite que o JwtModule 
    // seja configurado de forma assíncrona, injetando o ConfigService para acessar 
    // as variáveis de ambiente no momento da configuração.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<StringValue>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '1d',
        },
      }),
      global: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH ?? './database.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    SpecialtiesModule,
    SchedulesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
