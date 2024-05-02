import { Injectable } from '@nestjs/common'
import { EnumBase } from './enum'

@Injectable()
export class UseCaseResponse {
  public isStatus = EnumBase.EnumIsStatusRepository.SUCCESS | EnumBase.EnumIsStatusRepository.FALSE
  public data: any
  public error: any | null
  public message: string

  public static Success(data: any) {
    const _resultService = new UseCaseResponse()

    _resultService.error = null
    _resultService.isStatus = 1
    _resultService.data = data

    return _resultService
  }

  public static False(error: any, message?: string) {
    const _resultService = new UseCaseResponse()

    _resultService.error = error
    _resultService.isStatus = 0
    _resultService.data = null
    _resultService.message = message ?? ''

    return _resultService
  }
}
