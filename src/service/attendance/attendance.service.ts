import { Injectable } from '@nestjs/common'
import { AttendanceModelDto } from 'src/modelDTO'
import { Attendance, Prisma, Upload, User } from '@prisma/client'
import { AttendanceRepository } from 'src/repository/attendance.repository'
import { UploadService } from '../upload/upload.service'
import { UserService } from '../user/user.service'

@Injectable()
export class AttendanceService {
  constructor(
    private readonly _baseAttendanceRepo: AttendanceRepository,
    private readonly _baseUploadService: UploadService,
    private readonly _baseUserService: UserService
  ) {}

  private _select: Prisma.AttendanceSelect = {
    id: true,
    status: true,
    created_at: true,
    deleted_at: true,
    user: {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        uploads: {
          select: {
            id: true,
            name: true,
            status: true,
            user_id: true
          }
        },
        email: true,
        language: true,
        deleted_at: true
      }
    }
  }

  public async findManyByUserId(ids: string[], msg_timestamp: string) {
    const result = await this._baseAttendanceRepo.queryPaging({
      page: 1,
      limit: ids.length,
      option: {
        where: { user_id: { in: ids }, created_at: { gte: new Date(msg_timestamp) } }
      }
    })

    const uploadResult = await this._baseUploadService.findMany({
      search: '',
      ids: result.items.map((item) => item.user.id)
    })

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        user: { ...item.user, uploads: uploadResult.items.find((upload) => upload.user_id === item.user.id) ?? null }
      }))
    }
  }

  private setFilterQuery(msg_timestamp: string) {
    const newStartDate = new Date(msg_timestamp).setUTCHours(0, 0, 0, 0)
    const newEndDate = new Date(msg_timestamp).setUTCHours(23, 59, 59, 999)
    return {
      lte: new Date(newEndDate).toISOString(),
      gte: new Date(newStartDate).toISOString()
    }
  }

  public async findOneByUser(user_id: string, msg_timestamp: string) {
    const { lte, gte } = this.setFilterQuery(msg_timestamp)

    const result = (await this._baseAttendanceRepo.queryFirst({
      where: {
        user_id,
        created_at: {
          lte,
          gte
        }
      },
      select: this._select
    })) as Attendance & { user: User & { uploads: Upload } }

    if (!result) {
      return null
    }

    const uploadResult = await this._baseUploadService.findOneByUserId(result.user.id)

    result.user.uploads = uploadResult
      ? {
          ...result.user.uploads,
          id: uploadResult.id,
          name: uploadResult.name,
          status: uploadResult.status,
          user_id: uploadResult.user_id
        }
      : null

    return result
  }

  public async create(user_id: string, msg_timestamp: string, status: boolean) {
    const result = await this._baseAttendanceRepo.insertFirst({
      data: {
        user: {
          connect: {
            id: user_id
          }
        },
        status,
        created_at: new Date(msg_timestamp)
      }
    })

    return result
  }

  public async findMany(query: AttendanceModelDto.QueryAllAttendanceDto & { user_id?: string }) {
    const { lte, gte } = this.setFilterQuery(query['date_time'] ?? new Date().toISOString())

    const where = {
      deleted_at: { isSet: false },
      created_at: { lte, gte }
    }
    if (query.user_id) {
      Object.assign(where, {
        user_id: query.user_id
      })
    }

    console.log('where', where)

    const result = await this._baseAttendanceRepo.queryPaging({
      limit: query['limit'],
      page: query['page'],
      option: {
        where: {
          deleted_at: { isSet: false },
          created_at: { lte, gte }
        },
        select: this._select
      }
    })

    const uploadResult = await this._baseUploadService.findMany({
      search: '',
      ids: result.items.map((item) => item.user.id)
    })

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        user: { ...item.user, uploads: uploadResult.items.find((upload) => upload.user_id === item.user.id) ?? null }
      }))
    }
  }

  public async findManyUser({ where }: { where: Prisma.UserWhereInput }) {
    const result = await this._baseUserService.findManyWith({ where })
    return result
  }
}
