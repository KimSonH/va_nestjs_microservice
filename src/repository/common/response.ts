import { TResponseQuery } from './interface'
import { EnumBase } from 'src/service/common'

export class BaseRepositoryResponse<T> {
  public isStatus: EnumBase.EnumIsStatusRepository.FALSE | EnumBase.EnumIsStatusRepository.SUCCESS
  public data: T | null = null
  public error = null

  constructor({ isStatus, data, error }: TResponseQuery<T>) {
    this.isStatus = isStatus
    this.data = data ? (data as T) : null
    this.error = error ? error : null
  }
}
