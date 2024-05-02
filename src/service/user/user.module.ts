import { Module } from '@nestjs/common'
import { HttpUserController } from 'src/controller'
import { UserService } from './user.service'
import { UploadService } from '../upload/upload.service'
import { KafkaModule } from 'src/configuration/kafka/kafka.module'
import { EmailModule } from '../email/email.module'
import { EmailService } from '../email/email.service'
import { JwtService } from '@nestjs/jwt'
import { CryptoLib, JwtGenerate } from 'src/utils'
@Module({
  controllers: [HttpUserController],
  imports: [KafkaModule, EmailModule],
  providers: [UserService, UploadService, EmailService, JwtService, JwtGenerate, CryptoLib],
  exports: [UserService]
})
export class UserModuleService {}
