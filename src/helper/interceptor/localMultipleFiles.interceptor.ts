import { AnyFilesInterceptor } from '@nestjs/platform-express'
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { diskStorage } from 'multer'
import { extname } from 'path'

interface LocalMultipleFilesInterceptorOptions {
  fieldName: string
  path?: string
  fileFilter?: MulterOptions['fileFilter']
  limits?: MulterOptions['limits']
}

function LocalMultipleFilesInterceptor(options: LocalMultipleFilesInterceptorOptions): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    filesInterceptor: NestInterceptor
    constructor(configService: ConfigService) {
      const filesDestination = configService.get('UPLOADED_FILES_DESTINATION')
      const destination = `${filesDestination}${options.path}`

      const multerOptions: MulterOptions = options.path
        ? {
            storage: diskStorage({
              destination,
              filename: this.editFileName
            }),
            fileFilter: options.fileFilter,
            limits: options.limits
          }
        : {
            fileFilter: options.fileFilter,
            limits: options.limits
          }

      this.filesInterceptor = new (AnyFilesInterceptor(multerOptions))()
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.filesInterceptor.intercept(...args)
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

export default LocalMultipleFilesInterceptor
