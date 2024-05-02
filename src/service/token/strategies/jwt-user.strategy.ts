import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtModelDto, UserModelDto } from 'src/modelDTO'
import { UserService } from 'src/service/user/user.service'

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt-user') {
  constructor(private readonly _baseRepo: UserService, readonly _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const headerRequest = request?.headers
          const cookie = request.cookies

          const keyCheckAuthentication = process.env.KEY_AUTHENTICATION
          const _getKeyAuthentication = headerRequest[keyCheckAuthentication] as string

          if (!keyCheckAuthentication || (!_getKeyAuthentication && !cookie.user_access_token)) {
            throw new UnauthorizedException()
          }

          let token = ''
          if (cookie.user_access_token) {
            token = cookie.user_access_token.replace('Bearer ', '')?.trim()
          } else {
            token = _getKeyAuthentication.replace('Bearer ', '')?.trim()
          }

          return token
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: _configService.get<string>('JWT_USER_ACCESS_SECRET'),
      issuer: _configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
      audience: _configService.get<string>('JWT_USER_CLIENT_HOST_APP')
    })
  }

  async validate(payload: JwtModelDto.PayloadJwt): Promise<UserModelDto.UserValidatedGuard> {
    const user = await this._baseRepo.findOneEmail(payload.email)
    if (!user) throw new UnauthorizedException()

    const { email, first_name, last_name, id } = user
    return { email, first_name, last_name, id }
  }
}
