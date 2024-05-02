import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { httpModuleService } from './httpModule.service'

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        maxRedirects: configService.get('HTTP_MAX_REDIRECTS')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [httpModuleService],
  exports: [httpModuleService]
})
export class httpModuleModuleService {}
