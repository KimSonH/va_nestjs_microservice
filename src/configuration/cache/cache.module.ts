import { Module } from '@nestjs/common'
import { CacheService } from './cache.service'
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
@Module({
  imports: [
    CacheModule.registerAsync<CacheModuleAsyncOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: `redis://${configService.get('REDIS_HOST')}:${parseInt(configService.get('REDIS_PORT'))}`
        })
      })
    })
  ],
  providers: [CacheService],
  exports: [CacheService]
})
export class CacheModuleService {}
