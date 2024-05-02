import { Prisma } from '@prisma/client'

export type IOptionUserCreate = Prisma.UserCreateArgs

export type IOptionUserQueryFirst = Prisma.UserFindFirstArgs

export type IOptionUserQueryMany = {
  option?: Prisma.UserFindManyArgs
  limit?: number
  page?: number
}

export type select = Prisma.UserSelect

export type IOptionUserUpdate = Prisma.UserUpdateArgs

export type IOptionUserDelete = Prisma.UserDeleteArgs

export type IOptionUserCreateMany = Prisma.UserCreateManyArgs

export type IOptionUserDeleteMany = Prisma.UserDeleteManyArgs

export type IOptionUserUpdateMany = Prisma.UserUpdateManyArgs
