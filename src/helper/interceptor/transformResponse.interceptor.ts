import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { TransformResponseInterceptorDTO } from './dto/transformResponse.dto'

export type TTransformResponseInterceptor<T> = {
  data: T
}

export class CustomTransformResponseInterceptor<T> implements NestInterceptor<T, TTransformResponseInterceptor<T>> {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<TTransformResponseInterceptor<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response?.hasOwnProperty('type_response') !== undefined) {
          delete response['type_response']
        }

        const responseTransform = new TransformResponseInterceptorDTO()

        responseTransform.data = response?.data !== undefined ? response?.data : response
        responseTransform.message = response?.message ?? 'Successfully'
        responseTransform.http_status = response?.http_status
        responseTransform.errors = response?.error ?? null

        return responseTransform
      })
    )
  }
}
