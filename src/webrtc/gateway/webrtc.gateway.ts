import { Logger, UseFilters } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { WebRTCManagerService } from 'src/configuration/webrtcManager/webrtcManager'
import { WsExceptionFilter } from 'src/helper/exception/ws-exception'
import { WebRTCNamespace } from 'src/modelDTO/webrtc'

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  transport: ['websocket', 'polling'],
  namespace: 'webrtc'
})
export class WebRTCGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(WebRTCGateway.name)

  constructor(private readonly _webrtcManager: WebRTCManagerService) {}

  @WebSocketServer() _server: Server

  async handleDisconnect(client: Socket) {
    await this._webrtcManager.removePeer(client.id).then((r) => {
      this._server.to(r).emit('peerDisconnect', client.id)
    })
    return client.disconnect(true)
  }

  @UseFilters(new WsExceptionFilter())
  @SubscribeMessage('sessionStart')
  async handleSession(@ConnectedSocket() client: Socket, @MessageBody() partner: string) {
    return await this._webrtcManager
      .makeSession(client.id, partner)
      .then((r) => {
        return r
      })
      .catch(() => {
        this._webrtcManager.formerRoots.push(WebRTCNamespace.getRootId(client))
        client.disconnect(true)
      })
  }

  @UseFilters(new WsExceptionFilter())
  @SubscribeMessage('offerRequest')
  async handleOfferRequest(@ConnectedSocket() client: Socket, @MessageBody() partner: string) {
    await this._webrtcManager.sendOfferRequest(client.id, partner).then(() => {
      this._server.to(partner).emit('offerRequest', client.id, WebRTCNamespace.getRootId(client))
    })
  }

  @UseFilters(new WsExceptionFilter())
  @SubscribeMessage('transfer')
  async handleTransfer(
    @ConnectedSocket() client: Socket,
    @MessageBody('to') partner: string,
    @MessageBody('json') json: any
  ) {
    await this._webrtcManager.transfer(client.id, partner, json).then(() => {
      this._server.to(partner).emit('transfer', { from: client.id, json: json })
    })
  }
}
