import { Module, Scope } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { CustomHttpException } from './helper/exception/httpException'
import { CustomTransformResponseInterceptor } from './helper/interceptor'
import { RepositoryModule } from './repository/repository.module'
import { WebSocketModule } from './websocket/websocket.module'
import { WebRTCModule } from './webrtc/webrtc.module'
import {
  AdminModuleService,
  AttendanceModuleService,
  AuthenticationAdminModuleService,
  ChatModuleService,
  HomeModuleService,
  TokenModuleService,
  UploadModuleService,
  UserModuleService
} from './service'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { NODE_ENV } from './helper/constant'
import { CacheModuleService } from './configuration/cache/cache.module'
import { EmailModule } from './service/email/email.module'
import { TokenModuleUserService } from './service/token/user/token.module'
import { AuthenticationUserModuleService } from './service/authentication/authentication.user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT_SERVER: Joi.number().required(),
        NODE_ENV: Joi.string().required().valid(NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
        AVATAR_UPLOADED_URL: Joi.string().required(),
        JWT_USER_ACCESS_EXPIRATION_TIME: Joi.number().required(),
        JWT_USER_TYPE_SECRET_APP: Joi.string().required(),
        JWT_USER_CLIENT_HOST_APP: Joi.string().required(),
        KEY_AUTHENTICATION: Joi.string().required(),
        JWT_ADMIN_ACCESS_SECRET: Joi.string().required(),
        JWT_ADMIN_ACCESS_EXPIRATION_TIME: Joi.number().required(),
        JWT_ADMIN_REFRESH_SECRET: Joi.string().required(),
        JWT_ADMIN_REFRESH_EXPIRATION_TIME: Joi.number().required()
      }),
      isGlobal: true,
      ignoreEnvFile: true,
      envFilePath: ['.env']
    }),
    CacheModuleService,
    WebSocketModule,
    WebRTCModule,
    RepositoryModule,
    UserModuleService,
    UploadModuleService,
    AuthenticationAdminModuleService,
    AuthenticationUserModuleService,
    AdminModuleService,
    TokenModuleService,
    TokenModuleUserService,
    AttendanceModuleService,
    HomeModuleService,
    EmailModule,
    ChatModuleService
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.DEFAULT,
      useClass: CustomTransformResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: CustomHttpException
    }
  ]
})
export class AppModule {}
