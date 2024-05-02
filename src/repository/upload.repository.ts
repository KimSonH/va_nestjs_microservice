import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'
import {
  IOptionUploadCreate,
  IOptionUploadDelete,
  IOptionUploadQueryFirst,
  IOptionUploadQueryMany,
  IOptionUploadUpdate
} from './implement'
import AppConstants from './common/constantApp'
import { Prisma } from '@prisma/client'

@Injectable()
export class UploadRepository {
  constructor(private readonly _prismaService: PrismaService) {}
  private _logger = new Logger(UploadRepository.name)

  public async insertFirst(option: IOptionUploadCreate) {
    try {
      const { data, select } = option
      const result = await this._prismaService.upload.create({
        data,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${UploadRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryFirst(option: IOptionUploadQueryFirst) {
    try {
      const { cursor, distinct, orderBy, select, skip, take, where } = option
      const result = await this._prismaService.upload.findFirst({
        cursor,
        distinct,
        orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
        select,
        skip,
        take,
        where
      })
      return result
    } catch (error) {
      this._logger.error(`[${UploadRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async updateFirst(option: IOptionUploadUpdate) {
    try {
      const { data, where, select } = option
      const result = await this._prismaService.upload.update({
        data,
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${UploadRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryPaging(options: IOptionUploadQueryMany) {
    try {
      const { option, limit, page } = options
      const { cursor, distinct, orderBy, select, where } = option
      const [total_record, items] = await this._prismaService.$transaction([
        this._prismaService.upload.count({ where: option.where }),
        limit
          ? this._prismaService.upload.findMany({
              skip: limit < 0 ? AppConstants.DEFAULT_LIMIT : (+page - 1) * +limit,
              take: limit < 0 ? undefined : +limit,
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              cursor,
              distinct,
              select,
              where
            })
          : this._prismaService.upload.findMany({
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              cursor,
              distinct,
              select,
              where
            })
      ])
      return { total_record, items }
    } catch (error) {
      this._logger.error(`[${UploadRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async delete(option: IOptionUploadDelete) {
    try {
      const { where, select } = option
      const result = await this._prismaService.upload.delete({
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${UploadRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
