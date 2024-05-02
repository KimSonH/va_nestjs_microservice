import { Catch, ArgumentsHost, Logger } from '@nestjs/common'
import { BaseWsExceptionFilter } from '@nestjs/websockets'

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private _logger = new Logger(WsExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host)
  }
}
