import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CacheModuleService } from 'src/configuration/cache/cache.module'
import { httpModuleModuleService } from 'src/configuration/httpModule/httpModule.module'

import { HttpChatController } from 'src/controller'
import { UserService } from '../user/user.service'
import { UploadService } from '../upload/upload.service'
import { CryptoLib } from 'src/utils'

@Module({
  imports: [httpModuleModuleService, ConfigModule, CacheModuleService],
  controllers: [HttpChatController],
  providers: [UserService, UploadService, CryptoLib]
})
export class ChatModuleService {}
