import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  IAbstractBaseRepository,
  IBaseQueryDelete,
  IBaseQueryDeleteMany,
  IBaseQueryFirst,
  IBaseQueryInsertFirst,
  IBaseQueryInsertMany,
  IBaseQueryUpdate,
  IBaseQueryUpdateMany
} from './implement/IBase.repository'
import { BaseRepositoryResponse } from './common/response'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'
import { TArgsOption, TSelectModel } from './common/interface'
import AppConstants from './common/constantApp'
import { EnumBase } from 'src/service/common'

@Injectable()
export class BaseRepository implements IAbstractBaseRepository {
  private _logger = new Logger(BaseRepository.name)

  constructor(private readonly _prismaService: PrismaService) {}

  public async updateItem<T>(options: IBaseQueryUpdate): Promise<BaseRepositoryResponse<T>> {
    const { model, option } = options
    const { data, select, where, include } = option
    try {
      const updateQueryResult = await this._prismaService[model].update({
        where: where,
        data: data,
        select: select,
        include: include
      })

      return new BaseRepositoryResponse<T>({
        data: updateQueryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async insertFirst<T>(options: IBaseQueryInsertFirst): Promise<BaseRepositoryResponse<T>> {
    const { model, option } = options
    const { data, select, include } = option
    try {
      const insertQueryResult = await this._prismaService[model].create({
        data: data,
        select: select,
        include: include
      })

      return new BaseRepositoryResponse<T>({
        data: insertQueryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async queryFirst<T>(options: IBaseQueryFirst): Promise<BaseRepositoryResponse<T>> {
    const { model, select, argsOption } = options
    const { where, include } = argsOption

    try {
      const queryResult = await this._prismaService[model].findFirst({
        select: select,
        where: where,
        include: include
      })

      return new BaseRepositoryResponse<T>({
        data: queryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async queryPaging<T>(options: {
    model: Prisma.ModelName
    select?: TSelectModel
    argsOption?: TArgsOption | any
    limit?: number
    page?: number
  }): Promise<BaseRepositoryResponse<T>> {
    const { model, select, argsOption, limit, page } = options

    try {
      const { orderBy, where, include } = argsOption

      const $transactionResult = await this._prismaService.$transaction([
        this._prismaService[model].count({ where: where }),

        limit
          ? this._prismaService[model].findMany({
              skip: limit < 0 ? AppConstants.DEFAULT_LIMIT : (+page - 1) * +limit,
              take: limit < 0 ? undefined : +limit,
              where: where,
              select: select,
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              include: include
            })
          : this._prismaService[model].findMany({
              where: where,
              select: select,
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              include: include
            })
      ])

      const [totalRecord, rows] = $transactionResult

      return new BaseRepositoryResponse<T>({
        data: {
          items: rows,
          totalRecord: totalRecord
        },
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        data: null,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async deleteItem<T>(options: IBaseQueryDelete): Promise<BaseRepositoryResponse<T>> {
    const { model, select, argsOption } = options
    const { where, include } = argsOption

    try {
      const queryResult = await this._prismaService[model].delete({
        select: select,
        where: where,
        include: include
      })

      return new BaseRepositoryResponse<T>({
        data: queryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async insertMany<T>(options: IBaseQueryInsertMany): Promise<BaseRepositoryResponse<T>> {
    const { model, option } = options
    const { data, select, include } = option
    try {
      const insertQueryResult = await this._prismaService[model].createMany({
        data: data,
        select: select,
        include: include
      })

      return new BaseRepositoryResponse<T>({
        data: insertQueryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async deleteMany<T>(options: IBaseQueryDeleteMany): Promise<BaseRepositoryResponse<T>> {
    const { model, select, argsOption } = options
    const { where, include } = argsOption

    try {
      const queryResult = await this._prismaService[model].deleteMany({
        select: select,
        where: where,
        include: include
      })

      return new BaseRepositoryResponse<T>({
        data: queryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }

  public async updateMany<T>(options: IBaseQueryUpdateMany): Promise<BaseRepositoryResponse<T>> {
    const { model, option } = options
    const { data, where } = option
    try {
      const updateQueryResult = await this._prismaService[model].updateMany({
        where: where,
        data: data
      })

      return new BaseRepositoryResponse<T>({
        data: updateQueryResult,
        isStatus: EnumBase.EnumIsStatusRepository.SUCCESS
      })
    } catch (error) {
      this._logger.error(error)

      return new BaseRepositoryResponse<T>({
        data: null,
        isStatus: EnumBase.EnumIsStatusRepository.FALSE,
        error: JSON.stringify(error).toString()
      })
    }
  }
}

export const BaseRepositoryFactory = {
  provide: IAbstractBaseRepository,
  useClass: BaseRepository
}
