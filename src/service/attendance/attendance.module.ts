import { Module } from '@nestjs/common'
import { AttendanceService } from './attendance.service'
import { HttpAttendanceController } from 'src/controller'
import { AttendanceTimeService } from './attendance.time.service'
import { UploadService } from '../upload/upload.service'
import { UserService } from '../user/user.service'
import { CryptoLib } from 'src/utils'

@Module({
  controllers: [HttpAttendanceController],
  providers: [AttendanceTimeService, AttendanceService, UploadService, UserService, CryptoLib],
  exports: [AttendanceTimeService, AttendanceService]
})
export class AttendanceModuleService {}
