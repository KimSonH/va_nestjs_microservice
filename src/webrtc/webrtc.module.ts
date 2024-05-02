import { Module } from '@nestjs/common'
import { WebRTCGateway } from './gateway'
import { WebRTCManagerModule } from 'src/configuration/webrtcManager/webrtcManager.module'

@Module({
  imports: [WebRTCManagerModule],
  providers: [WebRTCGateway],
  exports: [WebRTCGateway]
})
export class WebRTCModule {}
