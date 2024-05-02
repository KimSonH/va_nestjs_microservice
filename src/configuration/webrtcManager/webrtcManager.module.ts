import { Module } from '@nestjs/common'
import { WebRTCManagerService } from './webrtcManager'

@Module({
  providers: [WebRTCManagerService],
  exports: [WebRTCManagerService]
})
export class WebRTCManagerModule {}
