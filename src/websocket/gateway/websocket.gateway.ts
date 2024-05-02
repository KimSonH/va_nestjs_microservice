import { Logger, UseFilters } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  ConnectedSocket
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CacheService } from 'src/configuration/cache/cache.service'
import { httpModuleService } from 'src/configuration/httpModule/httpModule.service'
import { WebRTCManagerService } from 'src/configuration/webrtcManager/webrtcManager'
import { WsExceptionFilter } from 'src/helper/exception/ws-exception'
import * as jwt from 'jsonwebtoken'
import { ConfigService } from '@nestjs/config'
import { parseCookies } from 'src/utils'
import { UserService } from 'src/service/user/user.service'

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  transport: ['websocket', 'polling']
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebsocketGateway.name)

  constructor(
    private readonly _httpService: httpModuleService,
    private readonly _cacheService: CacheService,
    private readonly _manager: WebRTCManagerService,
    private readonly _configService: ConfigService,
    private readonly _baseUserService: UserService
  ) {}

  @WebSocketServer() _server: Server

  async afterInit() {
    this._server.of('/webrtc').on('connect', async (client) => {
      this._manager
        .setPeer(client)
        .then(({ isOfferer }: { isOfferer: boolean }) => {
          if (isOfferer) {
            this._server.of('/').sockets.forEach((_, id) => {
              if (!this._manager.peers.has(id)) {
                this._server.to(id).emit('webrtcHello', client.id)
              }
            })
          }
        })
        .catch((e) => {
          this.logger.error(e.message)
        })
    })

    setInterval(() => {
      const offerer = this._manager.getOfferer()
      this._server.sockets.sockets.forEach((_, id) => {
        if (offerer && offerer?.available && !this._manager.peers.has(id)) {
          this._server.to(id).emit('webrtcHello', offerer.id, this._manager.formerRoots.includes(id) ? true : false)
        }
      })
    }, 3000)
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Connect - ${client.id}`)
    client.join('chatRoom')
    const AIResponse = await this._cacheService.get('AIResponse')
    this._server.to('chatRoom').emit('isMessage', AIResponse)
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Disconnect - ${client.id}`)
    await this._cacheService.del('AIResponse')
    return client.disconnect(true)
  }

  @UseFilters(new WsExceptionFilter())
  @SubscribeMessage('userMessage')
  async handleMessage(@MessageBody('message') message: string, @ConnectedSocket() client: Socket) {
    let user = null
    try {
      const cookie = client.handshake.headers.cookie
      const token = parseCookies(cookie)
      user = jwt.verify(token['user_access_token'], this._configService.get<string>('JWT_USER_ACCESS_SECRET'), {
        ignoreExpiration: false,
        issuer: this._configService.get<string>('JWT_USER_TYPE_SECRET_APP'),
        audience: this._configService.get<string>('JWT_USER_CLIENT_HOST_APP')
      })
    } catch (error) {
      console.log('error', error)
      throw new WsException('Invalid Token')
    }

    const user_data = await this._baseUserService.findOneEmail(user.email)
    if (!user_data) throw new WsException('Invalid Token')

    if (!message || message.trim().length > 500) throw new WsException('Invalid message')
    this._cacheService.set('AIResponse', true)
    const data = await this._httpService
      .post(`${this._configService.get<string>('CHATBOT_API')}/chat-vr/`, {
        email: user_data.email,
        message: message,
        client_ip: client.handshake.headers.host,
        language: user_data.language
      })
      .catch(() => this._cacheService.set('AIResponse', false))

    if (data) {
      this._cacheService.set('AIResponse', false)
      this._server.to('chatRoom').emit('AIResponse', data)
    }
  }
}
