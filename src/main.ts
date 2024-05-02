import { NestFactory } from '@nestjs/core'
import { Logger as NestLogger } from '@nestjs/common'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Partitioners } from 'kafkajs'
import { AppModule } from './app.module'
import { middleware } from './helper/middleware/appMiddleware'
import { PrismaService } from './configuration/prisma/services/prisma.service'
import { ConfigService } from '@nestjs/config'
import { APP_CONSTANT } from './helper/constant'
import { RedisIoAdapter } from './configuration/redisio.adapter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  const isProduction = configService.get<string>('NODE_ENV') === 'production'

  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: APP_CONSTANT.BACKEND_CLIENT,
          brokers: configService.get('KAFKA_BROKER').split(',')
        },
        producer: {
          createPartitioner: Partitioners.LegacyPartitioner
        },
        subscribe: { fromBeginning: false },
        producerOnlyMode: true
      }
    })
    await app.startAllMicroservices()
  } catch (error) {
    app.close()
  }

  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()

  middleware(app)

  if (isProduction) {
    app.enable('trust proxy')
  }

  // NOTE: Config figma
  const prismaService = app.get(PrismaService)
  prismaService.enableShutdownHooks(app)

  await app.listen(process.env.PORT_SERVER)

  return app.getUrl()
}

;(async (): Promise<void> => {
  try {
    const url = await bootstrap()

    NestLogger.log(url, 'Bootstrap')
  } catch (error) {
    NestLogger.error(error, 'Bootstrap')
  }
})()
