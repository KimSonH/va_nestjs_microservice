import { Injectable } from '@nestjs/common'
import { AttendanceModelDto } from 'src/modelDTO'
import { AttendanceTimeRepository } from 'src/repository/attendance.time.repository'

@Injectable()
export class AttendanceTimeService {
  constructor(private readonly _baseAttendanceTimeRepo: AttendanceTimeRepository) {}

  public async create({ status, time }: AttendanceModelDto.CreateAttendanceTimeDto) {
    const [_, result] = await Promise.all([
      this._baseAttendanceTimeRepo.deleteMany({ where: {} }),
      this._baseAttendanceTimeRepo.insertFirst({
        data: {
          status,
          time
        }
      })
    ])
    return result
  }

  public async findOneByUserId() {
    const result = await this._baseAttendanceTimeRepo.queryFirst({
      where: { deleted_at: { isSet: false } }
    })
    return result
  }

  public async updateStatus(status: boolean) {
    const resultAttendance = await this.findOneByUserId()
    const result = await this._baseAttendanceTimeRepo.updateFirst({
      where: {
        id: resultAttendance.id
      },
      data: { status }
    })
    return result
  }
}
