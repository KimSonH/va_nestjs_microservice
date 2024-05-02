import { Module } from '@nestjs/common'
import { CacheModuleService } from 'src/configuration/cache/cache.module'
import { httpModuleModuleService } from 'src/configuration/httpModule/httpModule.module'
import { KafkaModule } from 'src/configuration/kafka/kafka.module'
import { WebRTCManagerModule } from 'src/configuration/webrtcManager/webrtcManager.module'
import { HttpWebSocketController } from 'src/controller/httpWebSocket.controller'
import { AttendanceModuleService } from 'src/service'
import { UploadService } from 'src/service/upload/upload.service'
import { UserService } from 'src/service/user/user.service'
import { VoiceService } from 'src/service/voice/voice.service'
import { WebsocketGateway } from './gateway'
import { CryptoLib } from 'src/utils'

@Module({
  controllers: [HttpWebSocketController],
  imports: [httpModuleModuleService, AttendanceModuleService, CacheModuleService, KafkaModule, WebRTCManagerModule],
  providers: [WebsocketGateway, VoiceService, UserService, UploadService, CryptoLib],
  exports: [WebsocketGateway]
})
export class WebSocketModule {}
