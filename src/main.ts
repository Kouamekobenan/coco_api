import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule, ObserveInstrument } from './app.module.js';
import { DomainExceptionFilter } from './module/auth/infrastructure/filters/domain-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // ── Sécurité ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  // ── CORS (ajustez les origines en production) ─────────────────────────────
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    credentials: true,
  });

  // ── Versioning des routes (ex: /v1/salons) ────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });

  // ── Validation globale des DTOs ───────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Supprime les propriétés non décorées
      forbidNonWhitelisted: true, // Rejette les requêtes avec des props inconnues
      transform: true,            // Transforme automatiquement les types primitifs
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Filtres d'exceptions du domaine (DDD) ──────────────────────────────────
  app.useGlobalFilters(new DomainExceptionFilter());

  // ── Préfixe global ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
  if (process.env.ENABLE_SWAGGER !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('Coco API')
      .setDescription(
        '🌺 **Coco Platform API** — Moteur de réservation pour salons de coiffure en Côte d\'Ivoire.\n\n' +
        '### Univers\n' +
        '- 💆‍♀️ **CocoMousso** — Salons femme (tresses, coloration, soins)\n' +
        '- ✂️ **Cocotaillé** — Barbershops & salons homme\n\n' +
        '### Authentification\n' +
        'Utilisez le bouton **Authorize** et saisissez votre `Bearer <token>`.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Entrez votre JWT Bearer token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('Auth', 'Authentification OTP par numéro de téléphone')
      .addTag('Salons', 'Gestion des salons & vitrine')
      .addTag('Services', 'Catalogue de services et variantes')
      .addTag('Staff', 'Gestion des coiffeurs et capacité')
      .addTag('Bookings', 'Moteur de réservation')
      .addTag('Queue', 'File d\'attente hybride (walk-in + RDV)')
      .addTag('CRM', 'Gestion clientèle & notes salon')
      .addTag('Payments', 'Paiements Mobile Money')
      .addTag('Loyalty', 'Programme de fidélité')
      .addTag('Admin', 'Back-office Super Admin')
      .setContact('Coco Team', '', 'contact@coco.ci')
      .setLicense('UNLICENSED', '')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Coco API — Documentation',
      customfavIcon: '🌺',
    });
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🌺 Coco API démarrée sur le port ${port}`);
  if (process.env.ENABLE_SWAGGER !== 'false') {
    console.log(`📚 Swagger disponible sur /docs\n`);
  }
}
await bootstrap();
