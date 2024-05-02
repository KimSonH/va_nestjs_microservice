import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { UserModelDto } from 'src/modelDTO'
import { JwtGenerate } from 'src/utils'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { TokenUserService } from '../token/user/token.service'
import * as bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'
import { UserRepository } from 'src/repository/user.repository'

@Injectable()
export class AuthenticationUserService {
  private _logger: Logger = new Logger(AuthenticationUserService.name)

  constructor(
    private readonly _baseRepo: UserRepository,
    private readonly _tokenService: TokenUserService,
    private readonly _configService: ConfigService,
    private readonly _jwtGenerate: JwtGenerate
  ) {}

  private _select: Prisma.UserSelect = {
    email: true,
    id: true,
    first_name: true,
    last_name: true,
    language: true,
    attendances: {
      select: {
        id: true,
        status: true
      }
    },
    uploads: {
      select: {
        id: true,
        name: true,
        status: true,
        user_id: true
      }
    },
    created_at: true,
    updated_at: true
  }

  public async login(response: Response, authentication: UserModelDto.UserDto) {
    try {
      const userRepo = await this.validateUser(authentication.email)
      if (!userRepo) throw new UnauthorizedException()
      const user = userRepo
      await this._tokenService.setUserTokensToHeader(response, authentication)
      const { user_access_token, user_refresh_token } = await this._tokenService.tokensToHeader(authentication)
      return {
        ...user,
        domain_upload: this._configService.get('AVATAR_UPLOADED_URL'),
        user_access_token,
        user_refresh_token
      }
    } catch (error) {
      this._logger.error(error)
      throw new BadRequestException(error)
    }
  }

  public async verifyTokenUser(token: string) {
    try {
      const infoToken = await this._jwtGenerate.verifyAsyncToken(token)

      return infoToken
    } catch (error) {
      this._logger.error(error)
      throw new BadRequestException(error)
    }
  }

  public async logout(response: Response) {
    try {
      await this._tokenService.logoutUser(response)
    } catch (error) {
      this._logger.error(error)
      throw new BadRequestException(error)
    }
  }

  public async validateUser(email: string) {
    const userRepo = await this._baseRepo.queryFirst({
      where: {
        email: email,
        deleted_at: { isSet: false }
      },
      select: this._select
    })
    if (!userRepo) {
      return null
    }
    return { ...userRepo, domain_upload: this._configService.get('AVATAR_UPLOADED_URL') }
  }

  public async update(id: string, { email, first_name, language, last_name }: UserModelDto.UserProfileDto) {
    const authentication = await this._baseRepo.updateFirst({
      where: { id },
      data: { email, last_name, first_name, language },
      select: this._select
    })

    if (!authentication) {
      return null
    }

    return {
      ...authentication,
      domain_upload: this._configService.get('AVATAR_UPLOADED_URL')
    }
  }

  public async changePassword(id: string, password: string) {
    const authentication = await this._baseRepo.updateFirst({
      where: { id },
      data: { password: await bcrypt.hash(password, 10) },
      select: this._select
    })

    if (!authentication) {
      return null
    }

    return {
      ...authentication,
      domain_upload: this._configService.get('AVATAR_UPLOADED_URL')
    }
  }
}
