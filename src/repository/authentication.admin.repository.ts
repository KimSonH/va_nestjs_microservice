import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { IOptionAuthenticationAdminQueryFirst } from './implement'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'

@Injectable()
export class AuthenticationAdminRepository {
  private _logger = new Logger(AuthenticationAdminRepository.name)

  constructor(private readonly _prismaService: PrismaService) {}

  public async queryFirst(option: IOptionAuthenticationAdminQueryFirst) {
    try {
      const { cursor, distinct, orderBy, select, skip, take, where } = option
      const result = await this._prismaService.admin.findFirst({
        cursor,
        distinct,
        orderBy,
        select,
        skip,
        take,
        where
      })
      return result
    } catch (error) {
      this._logger.error(`[${AuthenticationAdminRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
