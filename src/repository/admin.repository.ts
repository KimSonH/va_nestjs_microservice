import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { IOptionAdminCreate, IOptionAdminQueryFirst, IOptionAdminUpdate } from './implement'

import { PrismaService } from 'src/configuration/prisma/services/prisma.service'

@Injectable()
export class AdminRepository {
  private _logger = new Logger(AdminRepository.name)

  constructor(private readonly _prismaService: PrismaService) {}

  public async queryFirst(option: IOptionAdminQueryFirst) {
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
      this._logger.error(`[${AdminRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async updateFirst(option: IOptionAdminUpdate) {
    try {
      const { data, where, select } = option
      const result = await this._prismaService.admin.update({
        data,
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${AdminRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async insertFirst(option: IOptionAdminCreate) {
    try {
      const { data, select } = option
      const result = await this._prismaService.admin.create({
        data,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${AdminRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
