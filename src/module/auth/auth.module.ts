import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain Tokens
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface.js';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port.js';
import { TOKEN_SERVICE } from './application/ports/token-service.port.js';

// Application Use Cases
import { RegisterUserUseCase } from './application/usecases/register-user.usecase.js';
import { LoginUserUseCase } from './application/usecases/login-user.usecase.js';
import { GetProfileUseCase } from './application/usecases/get-profile.usecase.js';

// Infrastructure Adapters
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository.js';
import { BcryptHasherService } from './infrastructure/security/bcrypt-hasher.service.js';
import { JwtTokenService } from './infrastructure/security/jwt-token.service.js';
import { JwtStrategy } from './infrastructure/security/jwt.strategy.js';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard.js';

// Presentation Controllers
import { AuthController } from './presentation/controllers/auth.controller.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'coco-super-secret-jwt-key-2026',
        signOptions: {
          expiresIn: 86400, // 24h
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // IoC D.I. Bindings (DDD Ports -> Adapters)
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptHasherService,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },

    // Use cases
    RegisterUserUseCase,
    LoginUserUseCase,
    GetProfileUseCase,

    // Security
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    USER_REPOSITORY,
    TOKEN_SERVICE,
    JwtAuthGuard,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}
