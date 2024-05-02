import { Controller, Inject, OnModuleDestroy, OnModuleInit, UseInterceptors } from '@nestjs/common'
import { ClientKafka, EventPattern } from '@nestjs/microservices'
import { RpcLoggingInterceptor } from 'src/helper/interceptor'
import { AttendanceModelDto } from 'src/modelDTO'
import { AttendanceService } from 'src/service/attendance/attendance.service'
import { AttendanceTimeService } from 'src/service/attendance/attendance.time.service'
import { TopicsAIModelFaceRegTrigger } from 'src/service/common'
import { UserService } from 'src/service/user/user.service'
import { WebsocketGateway } from 'src/websocket/gateway'
import { BSON } from 'bson'
import { APP_CONSTANT } from 'src/helper/constant'

@Controller()
export class HttpWebSocketController implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly _websocketServer: WebsocketGateway,
    private readonly _attendanceService: AttendanceService,
    private readonly _attendanceTimeService: AttendanceTimeService,
    private readonly _userService: UserService,
    @Inject(APP_CONSTANT.VA_KAFKA) private _kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    try {
      await this._kafkaClient.connect()
    } catch (error) {
      await this._kafkaClient.close()
    }
  }

  async onModuleDestroy() {
    await this._kafkaClient.close()
  }

  @UseInterceptors(new RpcLoggingInterceptor())
  @EventPattern(TopicsAIModelFaceRegTrigger.TOPICS_FACE_REG)
  async AIModelFaceReg(data: AttendanceModelDto.AIModelFaceRegData) {
    const _resAttendanceTime = await this._attendanceTimeService.findOneByUserId()
    let status = false
    if (_resAttendanceTime) {
      const { time } = _resAttendanceTime
      const timeCheck = new Date(data.msg_timestamp)
      const hour = timeCheck.getHours()
      const minutes = timeCheck.getMinutes()
      status = hour * 60 + minutes <= Number(time) * 60 ? true : false
    }
    return data.objects.map((object) => {
      if (object.attribute) {
        const keys = Object.keys(object.attribute)
        const ids = keys.map((key) => key.split('-')[0])
        ids.map(async (id) => {
          if (BSON.ObjectId.isValid(id)) {
            const _user = await this._attendanceService.findOneByUser(id, data.msg_timestamp)
            if (!_user) {
              const userService = await this._userService.findOneById(id)
              if (userService) {
                const attendance = await this._attendanceService.create(userService.id, data.msg_timestamp, status)
                return this._websocketServer._server.emit('faceReg', {
                  ...userService,
                  attendances: { ...attendance }
                })
              }
            }
          }
        })
      }
    })
  }
}
