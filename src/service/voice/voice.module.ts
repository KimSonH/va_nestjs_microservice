import { Module } from '@nestjs/common'
import { httpVoiceController } from 'src/controller'
import { VoiceService } from './voice.service'

@Module({
  controllers: [httpVoiceController],
  providers: [VoiceService],
  exports: [VoiceService]
})
export class VoiceModuleService {}
