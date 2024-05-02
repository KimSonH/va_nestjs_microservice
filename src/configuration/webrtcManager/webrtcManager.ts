import { Injectable, Logger } from '@nestjs/common'
import { Socket } from 'socket.io'
import type { SocketId } from 'socket.io-adapter'
import { WebRTCNamespace } from 'src/modelDTO/webrtc'

@Injectable()
export class WebRTCManagerService {
  private readonly logger = new Logger('WebRTCManager')

  readonly peers = new Map<SocketId, WebRTCNamespace.Peer>()
  readonly formerRoots = new Array<string>()
  
  getOfferer() {
    return this.peers.get('offererRoot')
  }

  findRootId(peerId: SocketId) {
    const entry = Array.from(this.peers).find((item) => item[1]?.id === peerId)
    return entry ? entry[0] : undefined
  }

  getPeer(id: SocketId, rootId?: SocketId) {
    return this.peers.get(rootId || this.findRootId(id))
  }

  setRootId(rootId: SocketId) {
    this.peers.set(rootId, undefined)
    this.logger.debug(`Root ${rootId}: added`)
  }

  async setPeer(client: Socket) {
    const rootId = WebRTCNamespace.getRootId(client)
    if (!this.getPeer(undefined, rootId)) {
      const peer = new WebRTCNamespace.Peer(client)
      this.peers.set(rootId, peer)
      this.logger.log(`Peer ${peer.id}: registered as ${peer.role} (root ${rootId})`)
      return {
        rootId: rootId,
        isOfferer: peer.isOfferer()
      }
    } else {
      throw new Error(`Peer ${client.id} (root ${rootId}) exists`)
    }
  }

  async makeSession(own: SocketId, partner: SocketId) {
    const otherPeer = this.getPeer(partner)
    const peer = this.getPeer(own)
    otherPeer.addSession(peer, this.logger)
    this.logger.log(`Sess ${peer.addSession(otherPeer, this.logger) }: created`)
    return WebRTCNamespace.MessageStatus.SUCCESS
  }

  async removePeer(id: SocketId) {
    const removed = await this.clearSessions(id)
    const rootId = this.findRootId(id)
    this.peers.delete(rootId)
    this.logger.log(`Peer ${id}: unregistered`)
    return removed
  }

  private async clearSessions(id: string) {
    const peer = this.getPeer(id)
    if (peer && peer.sessCnt > 0) {
      const removed: string[] = []
      for (const [otherId, status] of peer.sessions) {
        if (status === WebRTCNamespace.SessionStatus.RUNNING) {
          const desc = peer.describeSession(otherId)
          try {
            // First remove the session from the other
            this.getPeer(otherId).removeSession(id)
          } catch {
            this.logger.debug(`Peer ${otherId}: already unregistered`)
          }

          // Then remove the session from us
          peer.removeSession(otherId)

          // Both done with removing
          removed.push(otherId)

          this.logger.log(`Sess ${desc} removed`)
        }
      }

      // Signal the remote clients to do their own clean up
      return removed
    }
  }

  async sendOfferRequest(own: SocketId, partner: SocketId) {
    const peer = this.getPeer(own)
    if (peer.role === WebRTCNamespace.Role.REQUESTER) {
      const status = peer.getSession(partner)
      if (status && status === WebRTCNamespace.SessionStatus.RUNNING) {
        this.logger.log(`Sess ${peer.describeSession(partner)}: ${own} --> new offer request`)
      } else {
        throw new Error(`${own} is either not in a session or you are not the requester`)
      }
    }
  }

  async transfer(own: SocketId, partner: SocketId, json: any) {
    const peer = this.getPeer(own)
    const status = this.getPeer(own).sessions.get(partner)
    if (status && status === WebRTCNamespace.SessionStatus.RUNNING) {
      this.logger.debug(`Sess ${peer.describeSession(partner)}: ${own} >>> ${JSON.stringify(json)}`)
    } else {
      throw new Error(`${own} is not in a session with ${partner}`)
    }
  }
}
