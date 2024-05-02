import { BadRequestException, ValidationPipeOptions } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { ExceptionModelDto } from 'src/modelDTO'

const validatePipeOptions: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  exceptionFactory(errors) {
    return validatePipeFactory(errors)
  },
  transformOptions: {
    enableImplicitConversion: true
  }
}

const validatePipeFactory = (errors: ValidationError[]) => {
  const result = errors.map((error) => {
    const _error = new ExceptionModelDto.ResponseExceptionValidate()
    _error.field = error.property
    _error.message = error.constraints[Object.keys(error.constraints)[0]]

    return _error
  })

  return new BadRequestException(result)
}

export default validatePipeOptions
