import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { VoiceService } from 'src/service/voice/voice.service'

@ApiTags('Common')
@Controller('/3dModel')
export class httpVoiceController {
  constructor(
    // @Inject(APP_CONSTANT.VOICE_CLIENT) private kafkaClient: ClientKafka,
    private readonly _voiceService: VoiceService
  ) {}
}
