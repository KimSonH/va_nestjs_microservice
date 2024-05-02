import { Prisma } from '@prisma/client'
import { EnumBase } from 'src/service/common'

export type TResponseQuery<T> = {
  isStatus?: EnumBase.EnumIsStatusRepository.FALSE | EnumBase.EnumIsStatusRepository.SUCCESS
  data: T | TDataPaging<T>
  error?: string
}

export type TDataPaging<T> = {
  totalRecord: number
  items: Array<T>
}

export type TListWhereOptionInput =
  | Prisma.UserWhereInput
  | Prisma.AdminWhereInput
  | Prisma.TokenWhereInput
  | Prisma.AttendanceWhereInput
  | Prisma.AttendanceTimeWhereInput

export type TSelectModel =
  | Prisma.UserSelect
  | Prisma.AdminSelect
  | Prisma.TokenSelect
  | Prisma.AttendanceSelect
  | Prisma.AttendanceTimeSelect

export type TArgsOption =
  | Omit<Prisma.UserFindManyArgs, 'skip' | 'take'>
  | Omit<Prisma.AdminFindManyArgs, 'skip' | 'take'>
  | Omit<Prisma.TokenFindManyArgs, 'skip' | 'take'>
  | Omit<Prisma.AttendanceFindManyArgs, 'skip' | 'take'>
  | Omit<Prisma.AttendanceTimeFindManyArgs, 'skip' | 'take'>

export type TArgsOptionFirst =
  | Prisma.UserFindFirstOrThrowArgs
  | Prisma.AdminFindFirstOrThrowArgs
  | Prisma.TokenFindFirstOrThrowArgs
  | Prisma.AttendanceFindFirstOrThrowArgs
  | Prisma.AttendanceTimeFindFirstOrThrowArgs

export type TArgsOptionCreate =
  | Prisma.UserCreateArgs
  | Prisma.AdminCreateArgs
  | Prisma.TokenCreateArgs
  | Prisma.AttendanceCreateArgs
  | Prisma.AttendanceTimeCreateArgs

export type TArgsOptionUpdate =
  | Prisma.UserUpdateArgs
  | Prisma.AdminUpdateArgs
  | Prisma.TokenUpdateArgs
  | Prisma.AttendanceUpdateArgs
  | Prisma.AttendanceTimeUpdateArgs

export type TArgsOptionCreateMany = Prisma.UserCreateManyInput[]

export type TArgsOptionUpdateMany = Prisma.UserUpdateManyArgs
