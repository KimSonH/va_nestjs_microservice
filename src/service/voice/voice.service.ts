import { Injectable } from '@nestjs/common'

@Injectable()
export class VoiceService {
  // constructor() {}

  public handelMessageFor3DModel(message: any): string | false {
    let data: {
      isBot: boolean
      locale: 'en_US' | 'ja_JP'
      content: string
      romaji: string | null
      audio_duration: number
    }

    if (typeof message === 'string') {
      data = { ...JSON.parse(message) }
    } else if (typeof message === 'object') {
      data = { ...message }
    }

    if (!data || !data.isBot) {
      return false
    }

    let voiceContent = ''
    if (data.locale == 'ja_JP') {
      voiceContent = data.romaji ?? ''
    } else {
      voiceContent = data.content ?? ''
    }

    if (voiceContent == '') {
      return false
    }

    return voiceContent
  }
}
