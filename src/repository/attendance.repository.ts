import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { IOptionAttendanceCreate, IOptionAttendanceQueryFirst, IOptionAttendanceQueryMany } from './implement'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'
import AppConstants from './common/constantApp'
import { Prisma } from '@prisma/client'

@Injectable()
export class AttendanceRepository {
  private _logger = new Logger(AttendanceRepository.name)

  constructor(private readonly _prismaService: PrismaService) {}

  public async insertFirst(option: IOptionAttendanceCreate) {
    try {
      const { data, select } = option
      const result = await this._prismaService.attendance.create({
        data,
        select
      })
      return result
    } catch (error) {
      this._logger.error(`[${AttendanceRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryFirst(option: IOptionAttendanceQueryFirst) {
    try {
      const { cursor, distinct, orderBy, select, skip, take, where } = option
      const result = await this._prismaService.attendance.findFirst({
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
      this._logger.error(`[${AttendanceRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }

  public async queryPaging(options: IOptionAttendanceQueryMany) {
    try {
      const { option, limit, page } = options
      const { cursor, distinct, orderBy, select, where } = option
      const [total_record, items] = await this._prismaService.$transaction([
        this._prismaService.attendance.count({ where: option.where }),
        limit
          ? this._prismaService.attendance.findMany({
              skip: limit < 0 ? AppConstants.DEFAULT_LIMIT : (+page - 1) * +limit,
              take: limit < 0 ? undefined : +limit,
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              cursor,
              distinct,
              select,
              where
            })
          : this._prismaService.attendance.findMany({
              orderBy: orderBy ?? { created_at: Prisma.SortOrder.desc },
              cursor,
              distinct,
              select,
              where
            })
      ])
      return { total_record, items }
    } catch (error) {
      this._logger.error(`[${AttendanceRepository.name}] ${error}`)
      throw new BadRequestException(error)
    }
  }
}
