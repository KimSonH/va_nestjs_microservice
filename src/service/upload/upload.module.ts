import { Module } from '@nestjs/common'
import { HttpUploadController } from 'src/controller'
import { UploadService } from './upload.service'
import { UserModuleService } from '../user/user.module'
import { KafkaModule } from 'src/configuration/kafka/kafka.module'

@Module({
  controllers: [HttpUploadController],
  imports: [KafkaModule, UserModuleService],
  providers: [UploadService],
  exports: [UploadService]
})
export class UploadModuleService {}
