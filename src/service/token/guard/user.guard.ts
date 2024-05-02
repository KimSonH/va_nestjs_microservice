import { CanActivate, ExecutionContext, Logger, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthenticationUserService } from 'src/service/authentication/authentication.user.service'

@Injectable()
export class UserGuard implements CanActivate {
  private _logger = new Logger(UserGuard.name)
  constructor(private readonly _authenticationUserService: AuthenticationUserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const headerRequest = request?.headers
    const cookie = request.cookies

    const keyCheckAuthentication = process.env.KEY_AUTHENTICATION
    const _getKeyAuthentication = headerRequest[keyCheckAuthentication]

    if (!keyCheckAuthentication || (!_getKeyAuthentication && !cookie.access_token)) {
      throw new UnauthorizedException()
    }

    let token = ''
    if (cookie.access_token) {
      token = cookie.access_token.replace('Bearer ', '')?.trim()
    } else {
      token = _getKeyAuthentication.replace('Bearer ', '')?.trim()
    }

    try {
      const infoToken = await this._authenticationUserService.verifyTokenUser(token)
      request['user'] = infoToken

      return true
    } catch (error) {
      this._logger.error(error)
      throw new UnauthorizedException()
    }
  }
}
