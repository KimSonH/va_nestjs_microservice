import { Catch, RpcExceptionFilter, Logger } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { RpcException } from '@nestjs/microservices'

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  private _logger = new Logger(ExceptionFilter.name)

  catch(exception: RpcException): Observable<any> {
    const stackException = exception.stack
    this._logger.error(stackException)
    return throwError(() => exception.getError())
  }
}
