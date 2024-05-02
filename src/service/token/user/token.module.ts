import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtUserRefreshStrategy, JwtUserStrategy, UserStrategy } from '../strategies'
import { TokenUserService } from './token.service'
import { CryptoLib, JwtGenerate } from 'src/utils'
import { UserModuleService } from 'src/service/user/user.module'
import { AuthenticationUserModuleService } from 'src/service/authentication/authentication.user.module'
import { UserGuard } from '../guard/user.guard'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    UserModuleService,
    AuthenticationUserModuleService
  ],
  providers: [
    TokenUserService,
    JwtUserStrategy,
    JwtUserRefreshStrategy,
    UserStrategy,
    UserGuard,
    JwtGenerate,
    CryptoLib
  ],
  exports: [TokenUserService, UserGuard, JwtGenerate, CryptoLib]
})
export class TokenModuleUserService {}
