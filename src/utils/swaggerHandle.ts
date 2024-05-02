import { HttpStatus, InternalServerErrorException } from '@nestjs/common'
import { ApiQueryOptions, ApiResponseOptions } from '@nestjs/swagger'
import { ExceptionModelDto } from 'src/modelDTO'

type SwaggerJSON = { json: unknown; description?: string }

export const SwaggerHandle = {
  defaultResponseBadRequest({ message, description }): ApiResponseOptions {
    return {
      schema: {
        example: {
          isStatus: false,
          http_status: HttpStatus.BAD_REQUEST,
          data: null,
          message: message,
          error: new ExceptionModelDto.ResponseExceptionValidate()
        }
      },
      description,
      status: HttpStatus.BAD_REQUEST
    }
  },

  defaultResponseServiceError(): ApiResponseOptions {
    return {
      schema: {
        example: {
          isStatus: false,
          http_status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: null,
          message: new InternalServerErrorException().message,
          error: []
        }
      },
      description: new InternalServerErrorException().message,
      status: HttpStatus.INTERNAL_SERVER_ERROR
    }
  },

  defaultResponseJSON({ json, description }: SwaggerJSON): ApiResponseOptions {
    return {
      content: json
        ? {
            'application/json': {
              schema: {
                example: json
              }
            }
          }
        : undefined,
      description,
      status: HttpStatus.OK
    }
  },

  defaultResponseListJSON({ json, description }: SwaggerJSON): ApiResponseOptions {
    return {
      content: json
        ? {
            'application/json': {
              schema: {
                example: {
                  items: [json],
                  totalRecord: 1
                }
              }
            }
          }
        : undefined,
      description,
      status: HttpStatus.OK
    }
  },

  defaultRequestJSON(json: unknown): ApiResponseOptions {
    return {
      schema: {
        example: json
      }
    }
  },

  defaultApiQueryOptions({ example, name, required, description }: ApiQueryOptions): ApiQueryOptions {
    return {
      schema: { example },
      required,
      name,
      description,
      explode: true,
      type: 'string'
    }
  }
}
