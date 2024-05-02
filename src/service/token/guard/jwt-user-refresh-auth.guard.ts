import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtUserRefreshAuthGuard extends AuthGuard('jwt-user-refresh') {}
