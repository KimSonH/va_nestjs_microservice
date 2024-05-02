import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import {
  IOptionAttendanceTimeCreate,
  IOptionAttendanceTimeDelete,
  IOptionAttendanceTimeDeleteMany,
  IOptionAttendanceTimeQueryFirst,
  IOptionAttendanceTimeUpdate
} from './implement'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'

@Injectable()
export class AttendanceTimeRepository {
  private _logger = new Logger(AttendanceTimeRepository.name)
  constructor(private _prismaService: PrismaService) {}

  public async insertFirst(option: IOptionAttendanceTimeCreate) {
    try {
      const { data, select } = option
      const result = await this._prismaService.attendanceTime.create({
        data,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${AttendanceTimeRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryFirst(option: IOptionAttendanceTimeQueryFirst) {
    try {
      const { cursor, distinct, orderBy, select, skip, take, where } = option
      const result = await this._prismaService.attendanceTime.findFirst({
        cursor,
        distinct,
        orderBy,
        select,
        skip,
        take,
        where
      })
      return result
    } catch (error) {
      this._logger.error(`[${AttendanceTimeRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async updateFirst(option: IOptionAttendanceTimeUpdate) {
    try {
      const { data, where, select } = option
      const result = await this._prismaService.attendanceTime.update({
        data,
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${AttendanceTimeRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async delete(option: IOptionAttendanceTimeDelete) {
    try {
      const { where, select } = option
      const result = await this._prismaService.attendance.delete({
        where,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${AttendanceTimeRepository.name}] ${error}`)
      throw error
    }
  }

  public async deleteMany(option: IOptionAttendanceTimeDeleteMany) {
    try {
      const { where } = option
      const result = await this._prismaService.attendanceTime.deleteMany({
        where
      })
      return result
    } catch (error) {
      this._logger.error(`[${AttendanceTimeRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
