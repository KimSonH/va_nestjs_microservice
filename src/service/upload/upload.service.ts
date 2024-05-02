import { Injectable, Logger } from '@nestjs/common'
import { UploadModelDto } from 'src/modelDTO'
import * as path from 'path'
import * as sharp from 'sharp'
import { ConfigService } from '@nestjs/config'
import { promises as fs } from 'fs'
import { Prisma, User } from '@prisma/client'
import { OptionalNullable } from '../common'
import { UploadRepository } from 'src/repository/upload.repository'

@Injectable()
export class UploadService {
  private _logger = new Logger(UploadService.name)
  constructor(private readonly _configService: ConfigService, private readonly _uploadService: UploadRepository) {}

  private _select: Prisma.UploadSelect = {
    id: true,
    name: true,
    status: true,
    user_id: true
  }

  private renameFile(file: string, id: string): string {
    return `${id}-${file}`
  }

  private getFilePath(file: string): string {
    return path.join(`${this._configService.get('UPLOADED_FILES_DESTINATION')}/avatars/${file}`)
  }

  private async cropAvatar(newPath: string, file_name: string, avatarDto: UploadModelDto.CreateImageDto) {
    try {
      const cropInfo = {
        left: parseFloat(avatarDto ? (avatarDto.x as string) : '0'),
        top: parseFloat(avatarDto ? (avatarDto.y as string) : '0'),
        width: parseFloat(avatarDto ? (avatarDto.width as string) : '100'),
        height: parseFloat(avatarDto ? (avatarDto.height as string) : '100')
      }

      const filePath = this.getFilePath(file_name)

      const image = sharp(filePath)

      const imageBuffer = await image.toBuffer()
      const meta = await sharp(imageBuffer).metadata()

      cropInfo.top = Math.round((cropInfo.top / 100) * meta.height)
      cropInfo.left = Math.round((cropInfo.left / 100) * meta.width)
      cropInfo.width = Math.round((cropInfo.width / 100) * meta.width)
      cropInfo.height = Math.round((cropInfo.height / 100) * meta.height)

      await image.extract(cropInfo).toFile(newPath)
      await fs.unlink(filePath)
    } catch (error) {
      this._logger.log(`[cropAvatar] ${JSON.stringify(error)}`)
      throw error
    }
  }

  public async uploadAvatar({
    user,
    file_name,
    old_avatar
  }: {
    user: OptionalNullable<User>
    file_name: string
    old_avatar: string
  }): Promise<string> {
    try {
      const newFileName = this.renameFile(
        user.first_name + user.last_name + `-${new Date().getTime()}` + '.jpg',
        user.id
      )
      const newPath = this.getFilePath(newFileName)

      if (old_avatar) {
        const oldAvatar = old_avatar.split('/').pop()
        try {
          await fs.unlink(this.getFilePath(oldAvatar))
        } catch {}
      }

      const filePath = this.getFilePath(file_name)
      const image = sharp(filePath)
      await image.toFile(newPath)
      await fs.unlink(filePath)

      return newFileName
    } catch (error) {
      this._logger.log(`[uploadAvatar] ${JSON.stringify(error)}`)
      throw error
    }
  }

  public async updateAvatar({ user, file_name }: { user: OptionalNullable<User>; file_name: string }) {
    try {
      const newFileName = this.renameFile(
        user.first_name + user.last_name + `-${new Date().getTime()}` + '.jpg',
        user.id
      )
      const newPath = this.getFilePath(newFileName)
      const filePath = this.getFilePath(file_name)
      const image = sharp(filePath)
      try {
        await image.toFile(newPath)
        await fs.unlink(filePath)
      } catch {}
      return newFileName
    } catch (error) {
      this._logger.log(`[updateAvatar] ${JSON.stringify(error)}`)
      throw error
    }
  }

  public async unLinkImage({ file_name }: { file_name: string }): Promise<string> {
    try {
      const filePath = this.getFilePath(file_name)
      await fs.unlink(filePath)
      return null
    } catch (error) {
      throw error
    }
  }

  public async insertFirst({
    file_name,
    user_id,
    status = false
  }: {
    file_name: string
    user_id?: string
    status?: boolean
  }) {
    const result = await this._uploadService.insertFirst({
      data: { name: file_name, user_id, status }
    })
    return result
  }

  public async findOneById(id: string) {
    const result = await this._uploadService.queryFirst({
      where: { id }
    })
    return result
  }

  public async update(id: string, name: string, user_id?: string) {
    const result = await this._uploadService.updateFirst({
      where: { id },
      data: { name, user_id }
    })
    return result
  }

  public async updateStatus(id: string, status: boolean) {
    const result = await this._uploadService.updateFirst({
      where: { id },
      data: { status }
    })
    return result
  }

  public async findManyUserNull(query: UploadModelDto.QueryAllUploadDto) {
    const result = await this._uploadService.queryPaging({
      limit: query['limit'],
      page: query['page'],
      option: {
        where: { user_id: null, deleted_at: { isSet: false } }
      }
    })
    return result
  }

  public async delete(id: string) {
    const result = await this._uploadService.delete({
      where: { id }
    })
    return result
  }

  public async deleteUpload() {
    const result = await this._uploadService.queryPaging({
      option: {
        where: { user_id: null, deleted_at: { isSet: false } }
      }
    })
    result.items.map((item) => {
      this.delete(item.id)
      this.unLinkImage({ file_name: item.name })
    })

    return null
  }

  public async findMany(query: UploadModelDto.QueryAllUploadDto) {
    const ids = query['ids']
      ? {
          user_id: { in: query['ids'] }
        }
      : {}

    const result = await this._uploadService.queryPaging({
      limit: query['limit'],
      page: query['page'],
      option: {
        where: {
          deleted_at: { isSet: false },
          ...ids
        },
        select: this._select
      }
    })

    return result
  }

  public async findOneByUserId(user_id: string) {
    const result = await this._uploadService.queryFirst({
      where: { deleted_at: { isSet: false }, user_id },
      select: this._select
    })
    return result
  }
}
