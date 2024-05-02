import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AdminModelDto, JwtModelDto } from 'src/modelDTO'
import { AdminService } from 'src/service/admin/admin.service'

@Injectable()
export class JwtAdminRefreshStrategy extends PassportStrategy(Strategy, 'jwt-admin-refresh') {
  constructor(private readonly _baseAdminRepo: AdminService, readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const headerRequest = request?.headers
          const cookie = request.cookies
          const keyCheckAuthentication = process.env.KEY_AUTHENTICATION
          const _getKeyAuthentication = headerRequest[keyCheckAuthentication] as string

          if (!keyCheckAuthentication || (!_getKeyAuthentication && !cookie.admin_refresh_token)) {
            throw new UnauthorizedException()
          }

          let token = ''
          if (cookie.admin_refresh_token) {
            token = cookie.admin_refresh_token.replace('Bearer ', '')?.trim()
          } else {
            token = _getKeyAuthentication.replace('Bearer ', '')?.trim()
          }

          return token
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('JWT_ADMIN_REFRESH_SECRET'),
      passReqToCallback: true,
      issuer: _configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
      audience: _configService.get<string>('JWT_USER_CLIENT_HOST_APP')
    })
  }

  async validate(payload: JwtModelDto.PayloadJwt): Promise<AdminModelDto.AdminValidatedGuard> {
    const admin = await this._baseAdminRepo.findOneByEmail(payload.email)
    const { email, first_name, last_name, id } = admin
    return { email, first_name, last_name, id }
  }
}
