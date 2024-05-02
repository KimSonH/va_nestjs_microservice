import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common'
import { EnumBase } from './enum'

const MESSAGE_SEVER_SUCCESS = 'Success'

@Injectable()
export class BaseServiceResponse<T> {
  public isStatus = EnumBase.EnumIsStatusRepository.SUCCESS | EnumBase.EnumIsStatusRepository.FALSE
  public data: T
  public error: any | null
  public message: string | null = null
  public http_status: number = HttpStatus.OK

  public static Ok<T>(data: any, message?: string) {
    const _resultService = new BaseServiceResponse<T>()

    _resultService.message = message ? message : MESSAGE_SEVER_SUCCESS
    _resultService.error = null
    _resultService.http_status = HttpStatus.OK
    _resultService.data = data

    return _resultService
  }

  public static False(error?: any, message?: string) {
    return error?.length !== 0
      ? BaseServiceResponse.BadRequest(error, message)
      : BaseServiceResponse.InternalService(error)
  }

  public static OkBool(isStatus, message?: string) {
    const _resultService = new BaseServiceResponse<boolean>()

    _resultService.data = isStatus
    _resultService.message = message ? message : MESSAGE_SEVER_SUCCESS
    _resultService.error = null
    _resultService.http_status = HttpStatus.OK

    return _resultService
  }

  public static BadRequest(error?: any, message?: string) {
    const _resultService = new BaseServiceResponse<boolean>()

    _resultService.data = null
    _resultService.message = message ? message : new BadRequestException().message
    _resultService.error = error ? error : null
    _resultService.http_status = HttpStatus.BAD_REQUEST

    return _resultService
  }

  public static Unauthorized(error?: any, message?: string) {
    const _resultService = new BaseServiceResponse<boolean>()

    _resultService.data = null
    _resultService.message = message ? message : new UnauthorizedException().message
    _resultService.error = error ? error : null
    _resultService.http_status = HttpStatus.UNAUTHORIZED

    return _resultService
  }

  public static InternalService(error?: any, message?: string) {
    const _resultService = new BaseServiceResponse<boolean>()

    _resultService.data = null
    _resultService.message = message ? message : new InternalServerErrorException().message
    _resultService.error = error ? error : null
    _resultService.http_status = HttpStatus.INTERNAL_SERVER_ERROR

    return _resultService
  }
}
