import { Prisma } from '@prisma/client'
import {
  TArgsOption,
  TArgsOptionCreate,
  TArgsOptionCreateMany,
  TArgsOptionFirst,
  TArgsOptionUpdate,
  TArgsOptionUpdateMany,
  TSelectModel
} from '../common/interface'
import { BaseRepositoryResponse } from '../common/response'

export abstract class IAbstractBaseRepository {
  abstract queryPaging: <T>(options: IBaseQueryPaging) => Promise<BaseRepositoryResponse<T>>
  abstract queryFirst: <T>(options: IBaseQueryFirst) => Promise<BaseRepositoryResponse<T>>
  abstract insertFirst: <T>(options: IBaseQueryInsertFirst) => Promise<BaseRepositoryResponse<T>>
  abstract updateItem: <T>(options: IBaseQueryUpdate) => Promise<BaseRepositoryResponse<T>>
  abstract deleteItem: <T>(options: IBaseQueryDelete) => Promise<BaseRepositoryResponse<T>>
  abstract insertMany: <T>(options: IBaseQueryInsertMany) => Promise<BaseRepositoryResponse<T>>
  abstract deleteMany: <T>(options: IBaseQueryDeleteMany) => Promise<BaseRepositoryResponse<T>>
  abstract updateMany: <T>(options: IBaseQueryUpdateMany) => Promise<BaseRepositoryResponse<T>>
}

export type IBaseQueryPaging = {
  model: Prisma.ModelName
  select?: TSelectModel
  argsOption?: TArgsOption
  limit?: number
  page?: number
}

export type IBaseQueryFirst = {
  model: Prisma.ModelName
  select?: TSelectModel
  argsOption?: TArgsOptionFirst | any
}

export type IBaseQueryInsertFirst = {
  model: Prisma.ModelName
  option: TArgsOptionCreate | any
}

export type IBaseQueryUpdate = {
  model: Prisma.ModelName
  option: TArgsOptionUpdate | any
}

export type IBaseQueryDelete = {
  model: Prisma.ModelName
  select?: TSelectModel
  argsOption?: TArgsOptionFirst | any
}

export type IBaseQueryInsertMany = {
  model: Prisma.ModelName
  option: TArgsOptionCreateMany | any
}

export type IBaseQueryDeleteMany = {
  model: Prisma.ModelName
  select?: TSelectModel
  argsOption?: TArgsOptionFirst | any
}

export type IBaseQueryUpdateMany = {
  model: Prisma.ModelName
  option: TArgsOptionUpdateMany | any
}
