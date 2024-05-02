import { Prisma } from '@prisma/client'

export type IOptionAttendanceQueryMany = {
  option: Prisma.AttendanceFindManyArgs
  limit?: number
  page?: number
}

export type IOptionAttendanceCreate = Prisma.AttendanceCreateArgs

export type IOptionAttendanceQueryFirst = Prisma.AttendanceFindFirstArgs
