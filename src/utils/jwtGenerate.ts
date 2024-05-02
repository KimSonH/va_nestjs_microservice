import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { JwtModelDto } from 'src/modelDTO'

@Injectable()
export class JwtGenerate {
  private _logger = new Logger(JwtGenerate.name)
  constructor(private readonly _jwtService: JwtService, private readonly _configService: ConfigService) {}

  public async setCookieWithJwtToken(
    authentication: JwtModelDto.PayloadJwt
  ): Promise<JwtModelDto.AccessTokenForCookie> {
    try {
      const accessToken = await this.createAccessToken(authentication)

      const _assetTokenForCookie = new JwtModelDto.AccessTokenForCookie()
      _assetTokenForCookie.access_token = accessToken
      _assetTokenForCookie.options = {
        expires: new Date(Date.now() + this._configService.get<number>('JWT_ADMIN_ACCESS_EXPIRATION_TIME')),
        httpOnly: true,
        path: '/',
        maxAge: this._configService.get<number>('JWT_USER_ACCESS_EXPIRATION_TIME') * 1000,
        secure: true,
        sameSite: 'strict'
      }

      return _assetTokenForCookie
    } catch (error) {
      this._logger.error(error)
    }
  }

  public async setCookieWithJwtRefreshToken(
    authentication: JwtModelDto.PayloadJwt
  ): Promise<JwtModelDto.RefreshTokenForCookie> {
    try {
      const refreshToken = await this.createRefreshToken(authentication)

      const _assetTokenForCookie = new JwtModelDto.RefreshTokenForCookie()
      _assetTokenForCookie.refresh_token = refreshToken
      _assetTokenForCookie.options = {
        expires: new Date(Date.now() + this._configService.get<number>('JWT_ADMIN_REFRESH_EXPIRATION_TIME')),
        httpOnly: true,
        path: '/',
        maxAge: this._configService.get<number>('JWT_USER_ACCESS_EXPIRATION_TIME') * 1000,
        secure: true,
        sameSite: 'strict'
      }

      return _assetTokenForCookie
    } catch (error) {
      this._logger.error(error)
    }
  }

  public async verifyAsyncToken(token: string): Promise<any> {
    try {
      const secretKey = this._configService.get<string>('JWT_ADMIN_ACCESS_SECRET')
      const jwtVerify = await this._jwtService.verify(token, {
        secret: secretKey
      })
      return jwtVerify
    } catch (error) {
      this._logger.error(error)
      return null
    }
  }

  private async createAccessToken(option: JwtModelDto.PayloadJwt): Promise<string> {
    try {
      const _tokenJwt = await this._jwtService.signAsync(
        { item: option },
        {
          secret: this._configService.get<string>('JWT_ADMIN_ACCESS_SECRET'),
          expiresIn: this._configService.get<number>('JWT_ADMIN_ACCESS_EXPIRATION_TIME'),
          issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
          audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
        }
      )

      return _tokenJwt
    } catch (error) {
      this._logger.error(error)
      return ''
    }
  }

  private async createRefreshToken(option: JwtModelDto.PayloadJwt): Promise<string> {
    try {
      const _tokenJwt = await this._jwtService.signAsync(
        { item: option },
        {
          secret: this._configService.get<string>('JWT_ADMIN_ACCESS_SECRET'),
          expiresIn: this._configService.get<number>('JWT_ADMIN_REFRESH_EXPIRATION_TIME'),
          issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
          audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
        }
      )

      return _tokenJwt
    } catch (error) {
      this._logger.error(error)
      return ''
    }
  }
}
