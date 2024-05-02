import {
  Bind,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common'
// import { EventPattern } from '@nestjs/microservices'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { QueryPagingDTO, UserModelDto } from 'src/modelDTO'
import { BaseServiceResponse } from 'src/service/common'
// import { JwtUserAuthGuard } from 'src/service/token/guard/jwt-user-auth.guard'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'
// import { WebsocketGateway } from 'src/websocket/gateway'
import { httpModuleService } from 'src/configuration/httpModule/httpModule.service'
import { ConfigService } from '@nestjs/config'
import { CacheService } from 'src/configuration/cache/cache.service'
import { JwtUserAuthGuard } from 'src/service/token/guard/jwt-user-auth.guard'
import { UserService } from 'src/service/user/user.service'
import { QueryMessageIdEndDTO } from 'src/modelDTO/chat/base'

@ApiTags('Common')
@Controller('/chats')
export class HttpChatController {
  private readonly logger = new Logger(HttpChatController.name)
  constructor(
    // private readonly _websocketServer: WebsocketGateway,
    private readonly _httpService: httpModuleService,
    private readonly _configService: ConfigService,
    private readonly _cacheService: CacheService,
    private readonly _baseUserService: UserService
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtUserAuthGuard)
  @Get('/messages')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getProfile(request: UserModelDto.UserRequest, @Query() query: QueryMessageIdEndDTO) {
    const _email = request.user.email
    const user_data = await this._baseUserService.findOneEmail(_email)
    if (!user_data) throw new BadRequestException('Invalid Token')
    const { data } = await this._httpService
      .get(`${this._configService.get<string>('CHATBOT_API')}/chat-vr/`, {
        email: _email,
        language: user_data.language,
        client_ip: request.headers['host'],
        start_at: query.last_id
      })
      .catch(() => this._cacheService.set('AIResponse', false))
      // console.log('data', data)

    return BaseServiceResponse.Ok(data)
  }
}
