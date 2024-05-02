import { CanActivate, ExecutionContext, Logger, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthenticationAdminService } from 'src/service/authentication/authentication.admin.service'

@Injectable()
export class AdminGuard implements CanActivate {
  private _logger = new Logger(AdminGuard.name)
  constructor(private readonly _authenticationAdminService: AuthenticationAdminService) {}

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
      const infoToken = await this._authenticationAdminService.verifyTokenAdmin(token)
      request['user'] = infoToken

      return true
    } catch (error) {
      this._logger.error(error)
      throw new UnauthorizedException()
    }
  }
}
