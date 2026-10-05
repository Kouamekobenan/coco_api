import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DistributedLockService } from './distributed-lock.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DistributedLockService],
  exports: [DistributedLockService],
})
export class LockModule {}
