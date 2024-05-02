import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AdminModelDto, JwtModelDto } from 'src/modelDTO'
import { NODE_ENV } from 'src/helper/constant'
import { Response } from 'express'

@Injectable()
export class TokenService {
  constructor(private readonly _jwtService: JwtService, private readonly _configService: ConfigService) {}

  private async createAdminAccessToken(payload: JwtModelDto.PayloadJwt): Promise<string> {
    return this._jwtService.signAsync(payload, {
      secret: this._configService.get<string>('JWT_ADMIN_ACCESS_SECRET'),
      expiresIn: this._configService.get<number>('JWT_ADMIN_ACCESS_EXPIRATION_TIME'),
      issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
      audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
    })
  }

  private async createAdminRefreshToken(payload: JwtModelDto.PayloadJwt): Promise<string> {
    return this._jwtService.signAsync(payload, {
      secret: this._configService.get<string>('JWT_ADMIN_REFRESH_SECRET'),
      expiresIn: this._configService.get<number>('JWT_ADMIN_REFRESH_EXPIRATION_TIME'),
      issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
      audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
    })
  }

  private async getCookieWithJwtAdminAccessToken(
    authentication: AdminModelDto.AdminDto
  ): Promise<JwtModelDto.AccessTokenForCookie> {
    const payload: JwtModelDto.PayloadJwt = {
      email: authentication.email,
      first_name: authentication.first_name,
      last_name: authentication.last_name
    }

    const accessToken = await this.createAdminAccessToken(payload)

    return {
      access_token: accessToken,
      options: {
        expires: new Date(Date.now() + this._configService.get<number>('JWT_ADMIN_ACCESS_EXPIRATION_TIME')),
        httpOnly: false,
        path: '/',
        maxAge: this._configService.get<number>('JWT_ADMIN_ACCESS_EXPIRATION_TIME') * 1000,
        secure: false,
        sameSite: 'strict'
      }
    }
  }

  private async getCookieWithJwtAdminRefreshToken(
    authentication: AdminModelDto.AdminDto
  ): Promise<JwtModelDto.RefreshTokenForCookie> {
    const payload: JwtModelDto.PayloadJwt = {
      email: authentication.email,
      first_name: authentication.first_name,
      last_name: authentication.last_name
    }

    const refreshToken = await this.createAdminRefreshToken(payload)

    return {
      refresh_token: refreshToken,
      options: {
        expires: new Date(Date.now() + this._configService.get<number>('JWT_ADMIN_REFRESH_EXPIRATION_TIME')),
        httpOnly: false,
        path: '/',
        maxAge: this._configService.get<number>('JWT_ADMIN_REFRESH_EXPIRATION_TIME') * 1000,
        secure: false,
        sameSite: 'strict'
      }
    }
  }

  public async tokensToHeader(authentication: AdminModelDto.AdminDto) {
    const accessTokenCookie = await this.getCookieWithJwtAdminAccessToken(authentication)
    const refreshTokenCookie = await this.getCookieWithJwtAdminRefreshToken(authentication)
    return { admin_access_token: accessTokenCookie.access_token, admin_refresh_token: refreshTokenCookie.refresh_token }
  }

  public async setAdminTokensToHeader(response: Response, authentication: AdminModelDto.AdminDto) {
    const accessTokenCookie = await this.getCookieWithJwtAdminAccessToken(authentication)
    const refreshTokenCookie = await this.getCookieWithJwtAdminRefreshToken(authentication)
    response.cookie('admin_access_token', accessTokenCookie.access_token, { ...accessTokenCookie.options })
    response.cookie('admin_refresh_token', refreshTokenCookie.refresh_token, { ...refreshTokenCookie.options })
  }

  public async logoutAdmin(response: Response) {
    response.clearCookie('admin_access_token')
    response.clearCookie('admin_refresh_token')
  }
}
