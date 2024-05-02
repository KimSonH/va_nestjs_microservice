import { FileInterceptor } from '@nestjs/platform-express'
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { diskStorage } from 'multer'
import { extname } from 'path'

interface LocalFilesInterceptorOptions {
  fieldName: string
  path?: string
  fileFilter?: MulterOptions['fileFilter']
  limits?: MulterOptions['limits']
}

function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('UPLOADED_FILES_DESTINATION')

      const destination = `${filesDestination}${options.path}`

      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination,
          filename: this.editFileName
        }),
        fileFilter: options.fileFilter,
        limits: options.limits
      }

      this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions))()
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args)
    }

    editFileName = (req, file, callback) => {
      const fileExtName = extname(file.originalname)
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('')
      callback(null, `${randomName}${fileExtName}`)
    }
  }
  return mixin(Interceptor)
}

export default LocalFilesInterceptor
