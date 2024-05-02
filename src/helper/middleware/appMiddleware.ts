import { INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { swaggerConfig } from 'src/configuration/swagger'
import validatePipeOptions from 'src/configuration/validatePipe'
import { CustomLogInterceptor } from '../interceptor'
import { ConfigService } from '@nestjs/config'
import * as express from 'express'
import * as cookieParser from 'cookie-parser'

export function middleware(app: INestApplication): INestApplication {
  const configService = app.get(ConfigService)
  const isProduction = configService.get<string>('NODE_ENV') === 'production'

  // app.useLogger(app.get(Logger))
  app.setGlobalPrefix('/api')
  app.enableShutdownHooks()
  app.enableCors({ origin: true, credentials: true })

  // app.use(morgan('dev'));
  app.use(
    helmet({
      contentSecurityPolicy: { reportOnly: true },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false
    })
  )

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe(validatePipeOptions))

  app.use('/uploads', express.static(`${configService.get<number>('UPLOADED_FILES_DESTINATION')}`))
  // app.useLogger(isProduction ? false : new Logger())
  app.useLogger(new Logger())

  if (!isProduction) {
    swaggerConfig(app)
    app.useGlobalInterceptors(new CustomLogInterceptor())
  }

  return app
}
