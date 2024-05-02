import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { JwtGenerate, CryptoLib } from 'src/utils'
import { TokenUserService } from '../token/user/token.service'
import { UploadService } from '../upload/upload.service'
import { HttpAuthenticationUserController } from 'src/controller/httpAuthentication.user.controller'
import { AuthenticationUserService } from './authentication.user.service'
import { KafkaModule } from 'src/configuration/kafka/kafka.module'
import { UserService } from '../user/user.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  controllers: [HttpAuthenticationUserController],
  imports: [KafkaModule, HttpModule],
  providers: [
    AuthenticationUserService,
    TokenUserService,
    JwtService,
    JwtGenerate,
    CryptoLib,
    UploadService,
    UserService
  ],
  exports: [AuthenticationUserService, JwtGenerate, CryptoLib]
})
export class AuthenticationUserModuleService {}
