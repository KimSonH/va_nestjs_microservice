import { Logger } from '@nestjs/common'
import { Socket } from 'socket.io'
import type { SocketId } from 'socket.io-adapter'

export namespace WebRTCNamespace {
  export enum Role {
    REQUESTER = 'requester',
    OFFERER = 'offerer'
  }

  export enum PartnerRoom {
    REQUESTER_ROOM = 'webRTCRequesterRoom',
    OFFERER_ROOM = 'webRTCOffererRoom'
  }

  export enum SessionStatus {
    RUNNING = 1,
    REMOVING = 0
  }

  export class Peer {
    readonly id: string
    readonly role: Role
    readonly sessMax: number
    readonly sessions: Map<string, SessionStatus>

    constructor(client: Socket) {
      this.id = client.id
      this.role = getRole(client)
      this.sessMax = (client.handshake.query.sessMax || 1) as number
      this.sessions = new Map<string, SessionStatus>()
    }

    get sessCnt(): number {
      return this.sessions.size
    }

    get available(): boolean {
      return this.sessCnt < this.sessMax
    }

    get ownRoom(): string {
      return this.role === Role.REQUESTER ? PartnerRoom.REQUESTER_ROOM : PartnerRoom.OFFERER_ROOM
    }

    get partnerRole(): Role {
      return this.role === Role.REQUESTER ? Role.OFFERER : Role.REQUESTER
    }

    get partnerRoom(): PartnerRoom {
      return this.role === Role.REQUESTER ? PartnerRoom.OFFERER_ROOM : PartnerRoom.REQUESTER_ROOM
    }

    get repr(): { id: string; role: string } {
      return { id: this.id, role: this.role.toLowerCase() }
    }

    isOfferer() {
      return this.role === Role.OFFERER ? true : false
    }

    addSession(peer: Peer, logger?: Logger) {
      if (this.sessCnt < this.sessMax) {
        this.sessions.set(peer.id, SessionStatus.RUNNING)
        logger.debug(`Peer ${this.id}: has ${this.sessCnt}/${this.sessMax} sessions`)
        return this.describeSession(peer.id)
      } else {
        peer.removeSession(this.id)
        throw new MaxSessionsExceededError(this)
      }
    }

    getSession(id: string) {
      return this.sessions.get(id)
    }

    describeSession(id: string) {
      return `${this.id} <-> ${id}`
    }

    updateSession(id: string, status: SessionStatus) {
      this.sessions.set(id, status)
    }

    removeSession(id: string) {
      if (this.sessions.has(id)) {
        this.sessions.delete(id)
      }
    }

    removeSessions(toDelete: string[]) {
      for (const id of toDelete) {
        this.removeSession(id)
      }
    }
  }

  export function getRootId(client: Socket) {
    return (client.handshake.query.root || 'offererRoot') as string
  }

  export function getRoleName(client: Socket) {
    return (client.handshake.query.role || 'offerer') as string
  }

  export function getRole(roleName: string): WebRTCNamespace.Role
  export function getRole(client: Socket): WebRTCNamespace.Role
  export function getRole(arg: string | Socket) {
    let roleName: string
    if (arg instanceof Socket) {
      roleName = getRoleName(arg)
    } else {
      roleName = arg
    }
    return roleName as Role
  }

  export function getPartnerRole(client: Socket): Role {
    return getRole(client) === Role.REQUESTER ? Role.OFFERER : Role.REQUESTER
  }

  export class MaxSessionsExceededError extends Error {
    constructor(peer: Peer) {
      super(`${peer.role} ${peer.id}'s max sessions (${peer.sessMax}) has been exceeded`)
      this.name = 'MaxSessionsExceededError'
    }
  }

  export enum MessageStatus {
    FAIL = 0,
    SUCCESS = 1
  }
}
