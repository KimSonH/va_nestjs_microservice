import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  private _logger = new Logger(RpcLoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToRpc().getData()
        const jsonPart = JSON.stringify(request).toString()
        this._logger.log(jsonPart)
      })
    )
  }
}
