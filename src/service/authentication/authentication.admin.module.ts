import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { HttpAuthenticationAdminController } from 'src/controller'
import { JwtGenerate, CryptoLib } from 'src/utils'
import { AuthenticationAdminService } from './authentication.admin.service'
import { TokenService } from '../token/admin/token.service'
import { UploadService } from '../upload/upload.service'
import { KafkaModule } from 'src/configuration/kafka/kafka.module'

@Module({
  controllers: [HttpAuthenticationAdminController],
  imports: [KafkaModule],
  providers: [AuthenticationAdminService, TokenService, JwtService, JwtGenerate, CryptoLib, UploadService],
  exports: [AuthenticationAdminService, JwtGenerate, CryptoLib]
})
export class AuthenticationAdminModuleService {}
