import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { AdminModelDto } from 'src/modelDTO'
import { JwtGenerate } from 'src/utils'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { AdminRepository } from 'src/repository/admin.repository'
import { TokenService } from '../token/admin/token.service'
import * as bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client'

@Injectable()
export class AuthenticationAdminService {
  private _logger: Logger = new Logger(AuthenticationAdminService.name)

  constructor(
    private readonly _baseAdminRepo: AdminRepository,
    private readonly _tokenService: TokenService,
    private readonly _configService: ConfigService,
    private readonly _jwtGenerate: JwtGenerate
  ) {}

  private _select: Prisma.AdminSelect = {
    email: true,
    id: true,
    first_name: true,
    last_name: true,
    language: true,
    camera: true
  }

  public async login(response: Response, authentication: AdminModelDto.AdminDto) {
    try {
      const adminRepo = await this.validateAdmin(authentication.email)
      const admin = adminRepo
      await this._tokenService.setAdminTokensToHeader(response, authentication)
      const { admin_access_token, admin_refresh_token } = await this._tokenService.tokensToHeader(authentication)
      return {
        ...admin,
        domain_upload: this._configService.get('AVATAR_UPLOADED_URL'),
        admin_access_token,
        admin_refresh_token
      }
    } catch (error) {
      this._logger.error(error)
      throw new BadRequestException(error)
    }
  }

  public async verifyTokenAdmin(token: string) {
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
      await this._tokenService.logoutAdmin(response)
    } catch (error) {
      this._logger.error(error)
      throw new BadRequestException(error)
    }
  }

  public async validateAdmin(email: string) {
    const adminRepo = await this._baseAdminRepo.queryFirst({
      where: { email: email },
      select: this._select
    })
    if (!adminRepo) {
      return null
    }
    return { ...adminRepo, domain_upload: this._configService.get('AVATAR_UPLOADED_URL') }
  }

  public async update(id: string, { email, first_name, language, last_name }: AdminModelDto.AdminProfileDto) {
    const authentication = await this._baseAdminRepo.updateFirst({
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

  public async create(body: AdminModelDto.AdminCreateDto) {
    const result = await this._baseAdminRepo.insertFirst({
      data: { ...body, password: await bcrypt.hash('22Canvas', 10) }
    })
    return result
  }

  public async updateBy(id: string, { camera, email, first_name, language, last_name }: AdminModelDto.AdminUpdateDto) {
    const authentication = await this._baseAdminRepo.updateFirst({
      where: { id },
      data: { camera, email, first_name, language, last_name },
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
