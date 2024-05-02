import { Prisma } from '@prisma/client'

export type IOptionUploadCreate = Prisma.UploadCreateArgs

export type IOptionUploadQueryFirst = Prisma.UploadFindFirstArgs

export type IOptionUploadUpdate = Prisma.UploadUpdateArgs

export type IOptionUploadQueryMany = {
  option?: Prisma.UploadFindManyArgs
  limit?: number
  page?: number
}

export type IOptionUploadDelete = Prisma.UploadDeleteArgs
