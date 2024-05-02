import { Prisma } from '@prisma/client'
import {
  IOptionUserCreate,
  IOptionUserCreateMany,
  IOptionUserDelete,
  IOptionUserDeleteMany,
  IOptionUserQueryFirst,
  IOptionUserQueryMany,
  IOptionUserUpdate,
  IOptionUserUpdateMany
} from './implement'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'
import AppConstants from './common/constantApp'

@Injectable()
export class UserRepository {
  private _logger = new Logger(UserRepository.name)

  constructor(private readonly _prismaService: PrismaService) {}

  public async insertFirst(option: IOptionUserCreate) {
    try {
      const { data, select } = option
      const result = await this._prismaService.user.create({
        data,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryFirst(option: IOptionUserQueryFirst) {
    try {
      const { cursor, distinct, orderBy, select, skip, take, where } = option
      const result = await this._prismaService.user.findFirst({
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
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryPaging(options: IOptionUserQueryMany) {
    try {
      const { option, limit, page } = options
      const { cursor, distinct, orderBy, select, where } = option
      const [total_record, items] = await this._prismaService.$transaction([
        this._prismaService.user.count({ where: option.where }),
        limit
          ? this._prismaService.user.findMany({
              skip: limit < 0 ? AppConstants.DEFAULT_LIMIT : (+page - 1) * +limit,
              take: limit < 0 ? undefined : +limit,
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              cursor,
              distinct,
              select,
              where
            })
          : this._prismaService.user.findMany({
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              cursor,
              distinct,
              select,
              where
            })
      ])
      return { total_record, items }
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async updateFirst(option: IOptionUserUpdate) {
    try {
      const { data, where, select } = option
      const result = await this._prismaService.user.update({
        data,
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async delete(option: IOptionUserDelete) {
    try {
      const { where, select } = option
      const result = await this._prismaService.user.delete({
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async insertMany(option: IOptionUserCreateMany) {
    try {
      const { data } = option
      const result = await this._prismaService.user.createMany({
        data
      })
      return result
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async deleteMany(option: IOptionUserDeleteMany) {
    try {
      const { where } = option
      const result = await this._prismaService.user.deleteMany({
        where
      })
      return result
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async updateMany(option: IOptionUserUpdateMany) {
    try {
      const { data, where } = option
      const result = await this._prismaService.user.updateMany({
        data,
        where
      })
      return result
    } catch (error) {
      this._logger.error(`[${UserRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
