import { Injectable } from '@nestjs/common'
import { AttendanceService } from '../attendance/attendance.service'
import { HomeModelDto, TypeChart } from 'src/modelDTO'
import { PrismaService } from 'src/configuration/prisma/services/prisma.service'

@Injectable()
export class HomeService {
  constructor(private readonly _attendanceService: AttendanceService, private readonly _prismaService: PrismaService) {}

  setFilterQuery(reportQuery: HomeModelDto.reportQueryDto) {
    const newStartDate = new Date(reportQuery.dateStart).setUTCHours(0, 0, 0, 0)
    const newEndDate = new Date(reportQuery.dateEnd).setUTCHours(23, 59, 59, 999)
    return {
      lte: new Date(newEndDate).toISOString(),
      gte: new Date(newStartDate).toISOString()
    }
  }

  async handleRawQueryByDate(gte: string, lte: string) {
    const startDate = new Date(gte)
    const endDate = new Date(lte)
    const timeStart = startDate.getTime()
    const timeEnd = endDate.getTime()
    let rawLoop = []
    for (let loopTime = timeStart + 3600000; loopTime < timeEnd; loopTime += 3600000) {
      const loopDay = new Date(loopTime).getHours()
      rawLoop = [...rawLoop, { time: loopDay, count: 0 }]
    }
    return rawLoop
  }

  async handleRawQueryByMonth(gte: string, lte: string) {
    const startDate = new Date(gte)
    const endDate = new Date(lte)
    const timeStart = startDate.getTime()
    const timeEnd = endDate.getTime() + 86400000
    let rawLoop = []
    for (let loopTime = timeStart + 86400000; loopTime < timeEnd; loopTime += 86400000) {
      const loopDay = new Date(loopTime).getDate()
      rawLoop = [...rawLoop, { time: loopDay, count: 0 }]
    }
    return rawLoop
  }

  async handleRawQueryByYear() {
    let rawLoop = []
    for (let loopTime = 1; loopTime <= 12; loopTime += 1) {
      rawLoop = [...rawLoop, { time: loopTime, count: 0 }]
    }
    return rawLoop
  }

  async QueryData(props: {
    result: { _count: number; created_at: Date }[]
    lte?: string
    gte?: string
    filter: string
    table: TypeChart
    timeZone?: number
  }) {
    const { result } = props
    let rawQuery, response

    switch (props?.filter) {
      case 'Date':
        rawQuery = await this.handleRawQueryByDate(props?.gte, props?.lte)
        response = [
          ...result
            .reduce((r, o) => {
              const key = new Date(o.created_at).getHours()

              const item =
                r.get(key) ||
                Object.assign(
                  {},
                  {
                    time: o.created_at,
                    count: o._count
                  },
                  {
                    time: '',
                    count: 0
                  }
                )

              item.time = key
              item.count += o._count

              return r.set(key, item)
            }, new Map())
            .values()
        ]
        break
      case 'Month':
        rawQuery = await this.handleRawQueryByMonth(props?.gte, props?.lte)
        response = [
          ...result
            .reduce((r, o) => {
              const key = new Date(o.created_at).getDate()

              const item =
                r.get(key) ||
                Object.assign(
                  {},
                  {
                    time: o.created_at,
                    count: o._count
                  },
                  {
                    time: '',
                    count: 0
                  }
                )

              item.time = key
              item.count += o._count

              return r.set(key, item)
            }, new Map())
            .values()
        ]
        break
      case 'Year':
        rawQuery = await this.handleRawQueryByYear()
        response = [
          ...result
            .reduce((r, o) => {
              const key = new Date(o.created_at).getMonth() + 1

              const item =
                r.get(key) ||
                Object.assign(
                  {},
                  {
                    time: o.created_at,
                    count: o._count
                  },
                  {
                    time: '',
                    count: 0
                  }
                )

              item.time = key
              item.count += o._count

              return r.set(key, item)
            }, new Map())
            .values()
        ]
        break
      default:
        return []
    }

    return (
      rawQuery
        .map((raw) => ({
          ...raw,
          count: response.find((res) => res.time === raw.time)?.count ?? raw.count
        }))
        .sort((a, b) => a.time - b.time) ?? []
    )
  }

  public async getDataChart(reportQuery: HomeModelDto.reportQueryDto) {
    const filterQuery: { lte?: string; gte?: string } = this.setFilterQuery(reportQuery)
    const groupByAttendance = await this._prismaService.attendance.groupBy({
      by: ['created_at'],
      where: {
        created_at: {
          lte: filterQuery.lte,
          gte: filterQuery.gte
        }
      },
      _count: true
    })
    const chartAttendance = await this.QueryData({
      ...filterQuery,
      result: groupByAttendance,
      filter: reportQuery?.filter,
      table: TypeChart.attendances,
      timeZone: reportQuery.timeZone
    })

    return {
      chartAttendance: { typeChart: TypeChart.attendances, chart: chartAttendance }
    }
  }
}
