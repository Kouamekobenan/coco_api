import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';
import { FileUploaderName } from './file-upload.interface.js';

@Module({
  providers: [
    CloudinaryService,
    {
      provide: FileUploaderName,
      useClass: CloudinaryService,
    },
  ],
  exports: [CloudinaryService, FileUploaderName],
})
export class CloudinaryModule {}
