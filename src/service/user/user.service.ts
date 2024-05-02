import { UserModelDto } from 'src/modelDTO/user'
import { OptionalNullable } from '../common'
import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { UploadModelDto } from 'src/modelDTO'
import { UserRepository } from 'src/repository/user.repository'
import { UploadService } from '../upload/upload.service'
import * as bcrypt from 'bcrypt'
import { CryptoLib, generatePassword } from 'src/utils'
import { TArgsOptionCreateMany } from 'src/repository/common/interface'

@Injectable()
export class UserService {
  constructor(
    private readonly _baseUserRepo: UserRepository,
    private readonly _baseUploadService: UploadService,
    private _cryptoLib: CryptoLib
  ) {}

  private readonly _select: Prisma.UserSelect = {
    id: true,
    email: true,
    first_name: true,
    last_name: true,
    created_at: true,
    updated_at: true,
    password: true,
    uploads: {
      select: {
        id: true,
        name: true,
        status: true,
        user_id: true
      }
    },
    language: true,
    status: true
  }

  public async create(body: UserModelDto.CreateUserDto) {
    const { email, first_name, language, last_name } = body
    const randomPassword = generatePassword(10)
    const result = await this._baseUserRepo.insertFirst({
      data: {
        email,
        first_name,
        language,
        last_name,
        password: await bcrypt.hash(randomPassword, 10)
      },
      select: this._select
    })
    return { ...result, password: randomPassword }
  }

  public async findOneEmail(email: string) {
    const result = await this._baseUserRepo.queryFirst({
      where: { deleted_at: { isSet: false }, email },
      select: this._select
    })

    if (!result) {
      return null
    }
    const uploadResult = await this._baseUploadService.findOneByUserId(result.id)

    result.uploads = uploadResult
      ? {
          ...result.uploads,
          id: uploadResult.id,
          name: uploadResult.name,
          status: uploadResult.status,
          user_id: uploadResult.user_id
        }
      : null

    return result
  }

  public async findMany(query: UserModelDto.QueryAllUserDto) {
    const or = query['search']
      ? {
          OR: [
            { first_name: { contains: query['search'] } },
            { last_name: { contains: query['search'] } },
            { email: { contains: query['search'] } }
          ]
        }
      : {}

    const status = query['status'] ? { status: query['status'] } : {}

    const result = await this._baseUserRepo.queryPaging({
      limit: query['limit'],
      page: query['page'],
      option: {
        where: {
          deleted_at: { isSet: false },
          ...status,
          ...or
        },
        select: this._select
      }
    })

    const uploadResult = await this._baseUploadService.findMany({
      search: '',
      ids: result.items.map((item) => item.id)
    })

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        uploads: uploadResult.items.find((upload) => upload.user_id === item.id) ?? null
      }))
    }
  }

  public async findManyWith({ where }: { where: Prisma.UserWhereInput }) {
    const result = await this._baseUserRepo.queryPaging({
      option: { where }
    })

    return result
  }

  public async findOneById(id: string) {
    const result = await this._baseUserRepo.queryFirst({
      where: { deleted_at: { isSet: false }, id },
      select: this._select
    })

    if (!result) {
      return null
    }

    const uploadResult = await this._baseUploadService.findOneByUserId(id)

    result.uploads = uploadResult
      ? {
          ...result.uploads,
          id: uploadResult.id,
          name: uploadResult.name,
          status: uploadResult.status,
          user_id: uploadResult.user_id
        }
      : null

    return result
  }

  public async update(id: string, { email, first_name, last_name, language }: UserModelDto.UpdateUserDto) {
    const result = await this._baseUserRepo.updateFirst({
      where: { id },
      data: { first_name, last_name, language, email },
      select: this._select
    })

    return result
  }

  public async updateAvatar(upload: UploadModelDto.UploadDto, user: OptionalNullable<User>) {
    const newFileName = await this._baseUploadService.updateAvatar({ user, file_name: upload.name })
    const result = await this._baseUploadService.update(upload.id, newFileName, user.id)
    return result
  }

  public async delete(id: string) {
    const result = await this._baseUserRepo.delete({
      where: { id },
      select: this._select
    })

    return result
  }

  public unlinkImage(id: string, file_name: string) {
    this._baseUploadService.delete(id)
    this._baseUploadService.unLinkImage({ file_name })
  }

  public async findManyUserId(id: string[]) {
    const result = await this._baseUserRepo.queryPaging({
      option: {
        where: { deleted_at: { isSet: false }, id: { in: id } },
        select: this._select
      }
    })

    const uploadResult = await this._baseUploadService.findMany({
      search: '',
      ids: result.items.map((item) => item.id)
    })

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        uploads: uploadResult.items.find((upload) => upload.user_id === item.id) ?? null
      }))
    }
  }

  public async findManyByEmail(email: string[]) {
    const result = await this._baseUserRepo.queryPaging({
      option: { where: { deleted_at: { isSet: false }, email: { in: email } } }
    })
    const uploadResult = await this._baseUploadService.findMany({
      search: '',
      ids: result.items.map((item) => item.id)
    })

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        uploads: uploadResult.items.find((upload) => upload.user_id === item.id) ?? null
      }))
    }
  }

  public async deleteMany(id: string[]) {
    this._baseUserRepo.deleteMany({
      where: { id: { in: id } }
    })

    return null
  }

  public async createMany(body: TArgsOptionCreateMany) {
    const result = await this._baseUserRepo.insertMany({
      data: {
        ...body
      }
    })

    return result
  }

  public async updateMany(id: string[], body: { status?: boolean; avatar?: string }) {
    this._baseUserRepo.updateMany({
      where: {
        id: { in: id }
      },
      data: { ...body }
    })

    return null
  }

  public async updateStatus(id: string, status: boolean) {
    const updateStatus = await this._baseUserRepo.updateFirst({
      data: { status },
      where: { id },
      select: this._select
    })

    return updateStatus
  }

  public async deleteUpload() {
    this._baseUploadService.deleteUpload()
  }

  public async validateUser(userPassword: string, password: string) {
    const isComparePassword = await this._cryptoLib.comparePassword(password, userPassword)
    if (!isComparePassword) {
      return null
    }
    return
  }
}
