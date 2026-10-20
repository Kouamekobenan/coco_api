import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { RegisterDeviceDto } from '../dtos/register-device.dto.js';

@Injectable()
export class RegisterDeviceUseCase {
  private readonly logger = new Logger(RegisterDeviceUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  public async register(
    userId: string,
    dto: RegisterDeviceDto,
  ): Promise<{ success: boolean; deviceId: string }> {
    await this.prisma.userDevice.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId: dto.deviceId,
        },
      },
      create: {
        userId,
        deviceId: dto.deviceId,
        platform: dto.platform,
        pushToken: dto.pushToken,
        appVersion: dto.appVersion,
        lastSeenAt: new Date(),
      },
      update: {
        platform: dto.platform,
        pushToken: dto.pushToken,
        appVersion: dto.appVersion,
        lastSeenAt: new Date(),
      },
    });

    this.logger.log(
      `[Device] Token FCM mis à jour pour l'appareil ${dto.deviceId} (User: ${userId}, Platform: ${dto.platform})`,
    );

    return {
      success: true,
      deviceId: dto.deviceId,
    };
  }

  public async unregister(
    userId: string,
    deviceId: string,
  ): Promise<{ success: boolean }> {
    await this.prisma.userDevice.deleteMany({
      where: {
        userId,
        deviceId,
      },
    });

    this.logger.log(
      `[Device] Appareil ${deviceId} dissocié pour l'utilisateur ${userId}`,
    );

    return {
      success: true,
    };
  }
}
