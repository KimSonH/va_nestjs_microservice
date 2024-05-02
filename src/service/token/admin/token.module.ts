import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AdminStrategy, JwtAdminRefreshStrategy, JwtAdminStrategy } from '../strategies'
import { AdminModuleService } from '../../admin/admin.module'
import { TokenService } from './token.service'
import { AdminGuard } from '../guard/admin.guard'
import { AuthenticationAdminModuleService } from '../../authentication/authentication.admin.module'
import { CryptoLib, JwtGenerate } from 'src/utils'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    AdminModuleService,
    AuthenticationAdminModuleService
  ],
  providers: [
    TokenService,
    JwtAdminStrategy,
    JwtAdminRefreshStrategy,
    AdminStrategy,
    AdminGuard,
    JwtGenerate,
    CryptoLib
  ],
  exports: [TokenService, AdminGuard, JwtGenerate, CryptoLib]
})
export class TokenModuleService {}
