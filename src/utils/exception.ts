import { HttpException, HttpStatus } from '@nestjs/common'

export type ErrorModel = {
  message: string
  error: [
    {
      field: string
      message: string
    }
  ]
}

type ParametersType = { [key: string]: unknown }

export class BaseException extends HttpException {
  readonly traceid: string
  readonly context: string
  readonly statusCode: number
  readonly code?: string
  readonly parameters: ParametersType

  constructor(message: string, status: HttpStatus, parameters?: ParametersType) {
    super(message, status)

    if (parameters) {
      this.parameters = parameters
    }

    this.statusCode = super.getStatus()
    Error.captureStackTrace(this)
  }
}

export class ApiInternalServerException extends BaseException {
  constructor(message?: string, parameters?: ParametersType) {
    super(message ?? 'InternalServerException', 500, parameters)
  }
}

export class ApiNotFoundException extends BaseException {
  constructor(message?: string, parameters?: ParametersType) {
    super(message ?? 'NotFoundException', 404, parameters)
  }
}

export class ApiConflictException extends BaseException {
  constructor(message?: string, parameters?: ParametersType) {
    super(message ?? 'ConflictException', 409, parameters)
  }
}

export class ApiUnauthorizedException extends BaseException {
  constructor(message?: string, parameters?: ParametersType) {
    super(message ?? 'UnauthorizedException', 401, parameters)
  }
}

export class ApiBadRequestException extends BaseException {
  constructor(message?: string, parameters?: ParametersType) {
    super(message ?? 'BadRequestException', 400, parameters)
  }
}

export class ApiForbiddenException extends BaseException {
  constructor(message?: string, parameters?: ParametersType) {
    super(message ?? 'BadRequestException', 403, parameters)
  }
}
