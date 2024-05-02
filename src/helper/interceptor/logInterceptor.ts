import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { LogInterceptorDTO } from './dto/logging.dto'

@Injectable()
export class CustomLogInterceptor implements NestInterceptor {
  private _logger = new Logger(CustomLogInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest()

        const { ip, hostname, method, path, params, body, message, query } = request

        const logMessage = new LogInterceptorDTO()
        logMessage.hostname = hostname
        logMessage.ip = ip
        logMessage.method = method
        logMessage.path = path
        logMessage.params = params
        logMessage.body = body
        logMessage.message = message
        logMessage.query = query

        const jsonPart = JSON.stringify(logMessage).toString()

        this._logger.log(jsonPart)
      })
    )
  }
}
