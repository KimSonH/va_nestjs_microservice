import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { JwtModelDto, UserModelDto } from 'src/modelDTO'
import { Response } from 'express'

@Injectable()
export class TokenUserService {
  constructor(private readonly _jwtService: JwtService, private readonly _configService: ConfigService) {}

  private async createUserAccessToken(payload: JwtModelDto.PayloadJwt): Promise<string> {
    return this._jwtService.signAsync(payload, {
      secret: this._configService.get<string>('JWT_USER_ACCESS_SECRET'),
      expiresIn: this._configService.get<number>('JWT_USER_ACCESS_EXPIRATION_TIME'),
      issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
      audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
    })
  }

  private async createUserRefreshToken(payload: JwtModelDto.PayloadJwt): Promise<string> {
    return this._jwtService.signAsync(payload, {
      secret: this._configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this._configService.get<number>('JWT_REFRESH_EXPIRATION_TIME'),
      issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
      audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
    })
  }

  private async getCookieWithJwtUserAccessToken(
    authentication: UserModelDto.UserDto
  ): Promise<JwtModelDto.AccessTokenForCookie> {
    const payload: JwtModelDto.PayloadJwt = {
      email: authentication.email,
      first_name: authentication.first_name,
      last_name: authentication.last_name
    }

    const accessToken = await this.createUserAccessToken(payload)

    return {
      access_token: accessToken,
      options: {
        expires: new Date(Date.now() + this._configService.get<number>('JWT_USER_ACCESS_EXPIRATION_TIME')),
        httpOnly: false,
        path: '/',
        maxAge: this._configService.get<number>('JWT_USER_ACCESS_EXPIRATION_TIME') * 1000,
        secure: false,
        sameSite: 'strict'
      }
    }
  }

  private async getCookieWithJwtUserRefreshToken(
    authentication: UserModelDto.UserDto
  ): Promise<JwtModelDto.RefreshTokenForCookie> {
    const payload: JwtModelDto.PayloadJwt = {
      email: authentication.email,
      first_name: authentication.first_name,
      last_name: authentication.last_name
    }

    const refreshToken = await this.createUserRefreshToken(payload)

    return {
      refresh_token: refreshToken,
      options: {
        expires: new Date(Date.now() + this._configService.get<number>('JWT_REFRESH_EXPIRATION_TIME')),
        httpOnly: false,
        path: '/',
        maxAge: this._configService.get<number>('JWT_REFRESH_EXPIRATION_TIME') * 1000,
        secure: false,
        sameSite: 'strict'
      }
    }
  }

  public async tokensToHeader(authentication: UserModelDto.UserDto) {
    const accessTokenCookie = await this.getCookieWithJwtUserAccessToken(authentication)
    const refreshTokenCookie = await this.getCookieWithJwtUserRefreshToken(authentication)
    return { user_access_token: accessTokenCookie.access_token, user_refresh_token: refreshTokenCookie.refresh_token }
  }

  public async setUserTokensToHeader(response: Response, authentication: UserModelDto.UserDto) {
    const accessTokenCookie = await this.getCookieWithJwtUserAccessToken(authentication)
    const refreshTokenCookie = await this.getCookieWithJwtUserRefreshToken(authentication)
    response.cookie('user_access_token', accessTokenCookie.access_token, { ...accessTokenCookie.options })
    response.cookie('user_refresh_token', refreshTokenCookie.refresh_token, { ...refreshTokenCookie.options })
  }

  public async logoutUser(response: Response) {
    response.clearCookie('user_access_token')
    response.clearCookie('user_refresh_token')
  }
}
