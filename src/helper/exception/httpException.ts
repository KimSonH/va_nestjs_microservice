import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException
} from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Response } from 'express'
import { ExceptionModelDto } from 'src/modelDTO'

@Catch(HttpException)
export class CustomHttpException implements ExceptionFilter {
  private _logger = new Logger(CustomHttpException.name)

  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const response: Response = ctx.getResponse()

    const stackException = exception.stack

    const _responseResult = new ExceptionModelDto.ResponseExceptionDTO()
    _responseResult.data = null

    if (exception instanceof NotFoundException) {
      _responseResult.message = exception.message
      _responseResult.errors = null
      _responseResult.http_status = HttpStatus.NOT_FOUND
    } else if (exception instanceof InternalServerErrorException) {
      _responseResult.message = new InternalServerErrorException().message
      _responseResult.errors = exception.stack
      _responseResult.http_status = HttpStatus.INTERNAL_SERVER_ERROR
    } else if (exception instanceof BadRequestException) {
      const stackErrors: any = exception.getResponse()
      _responseResult.message = new BadRequestException().message
      _responseResult.errors = stackErrors?.message
      _responseResult.http_status = HttpStatus.BAD_REQUEST
    } else if (exception instanceof ForbiddenException) {
      _responseResult.message = new ForbiddenException().message
      _responseResult.errors = []
      _responseResult.http_status = HttpStatus.FORBIDDEN
    } else if (exception instanceof UnauthorizedException) {
      _responseResult.message = new UnauthorizedException().message
      _responseResult.errors = []
      _responseResult.http_status = HttpStatus.UNAUTHORIZED
    }

    response.status(HttpStatus.OK).json(_responseResult)

    this._logger.error(stackException)
  }
}
