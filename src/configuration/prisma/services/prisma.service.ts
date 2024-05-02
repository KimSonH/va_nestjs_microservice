import { Injectable, OnModuleInit, INestApplication, Logger } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
import AppConstants from '../constant/app.constant'

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel> implements OnModuleInit {
  private readonly _logger = new Logger(PrismaService.name)

  constructor() {
    super({ log: AppConstants.CONFIG_LOG_QUERY_PRISMA })

    this.$use(async (params, next) => {
      if (params.action === 'delete') {
        params.action = 'update'
        params.args['data'] = { deleted_at: new Date() }
      } else if (params.action === 'deleteMany') {
        params.action = 'updateMany'
        if (params.args.data !== undefined) {
          params.args.data['deleted_at'] = new Date()
        } else {
          params.args['data'] = { deleted_at: new Date() }
        }
      }

      const result = await next(params)
      return result
    })
  }

  async onModuleInit() {
    this.showLog()

    await this.$connect()
  }

  async showLog() {
    this.$on('error', (event) => {
      this._logger.error(event)
    })
    this.$on('warn', (event) => {
      this._logger.warn(event)
    })
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close()
    })
  }
}
