import { Module } from '@nestjs/common'
import { HttpHomeController } from 'src/controller'
import { HomeService } from './home.service'
import { AttendanceModuleService } from '../attendance/attendance.module'
import { PrismaModule } from 'src/configuration/prisma/prisma.module'

@Module({
  imports: [AttendanceModuleService, PrismaModule],
  controllers: [HttpHomeController],
  providers: [HomeService],
  exports: [HomeService]
})
export class HomeModuleService {}
