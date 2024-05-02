import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { IOptionTokenCreate, IOptionTokenQueryFirst } from './implement'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'

@Injectable()
export class TokenRepository {
  private _logger = new Logger(TokenRepository.name)

  constructor(private readonly _prismaService: PrismaService) {}

  public async queryFirst(option: IOptionTokenQueryFirst) {
    try {
      const { cursor, distinct, orderBy, select, skip, take, where } = option
      const result = await this._prismaService.token.findFirst({
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
      this._logger.error(`[${TokenRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async insertFirst(option: IOptionTokenCreate) {
    try {
      const { data, select } = option
      const result = await this._prismaService.token.create({
        data,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${TokenRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
