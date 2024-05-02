import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ClientKafka, EventPattern } from '@nestjs/microservices'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { APP_CONSTANT } from 'src/helper/constant'
import { RpcLoggingInterceptor } from 'src/helper/interceptor'
import LocalFilesInterceptor from 'src/helper/interceptor/localFiles.interceptor'
import { ExceptionModelDto, UploadModelDto } from 'src/modelDTO'
import { BaseServiceResponse, TopicsAIModelFaceDetTrigger, TopicsAIModelFaceRegTrigger } from 'src/service/common'
import { JwtAdminAuthGuard } from 'src/service/token/guard/jwt-admin-auth.guard'
import { UploadService } from 'src/service/upload/upload.service'
import { UserService } from 'src/service/user/user.service'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'

@ApiTags('Common')
@Controller('uploads')
export class HttpUploadController implements OnModuleInit, OnModuleDestroy {
  private _logger = new Logger(HttpUploadController.name)

  constructor(
    @Inject(APP_CONSTANT.VA_KAFKA) private _kafkaClient: ClientKafka,
    private readonly _uploadService: UploadService,
    private readonly _userService: UserService
  ) {}

  async onModuleInit() {
    try {
      await this._kafkaClient.connect()
    } catch (error) {
      await this._kafkaClient.close()
    }
  }

  async onModuleDestroy() {
    this._kafkaClient.close()
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('avatar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseListJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'avatar',
      path: '/avatars',
      fileFilter: (request, file, callback) => {
        if (!new RegExp('(jpg|png|jpeg)$', 'i').test(file.mimetype)) {
          return callback(new BadRequestException('Format error'), false)
        }
        callback(null, true)
      },
      limits: {
        fileSize: Math.pow(1024, 2) * 5
      }
    })
  )
  public async addAvatarUser(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
      _exceptionValidate.field = 'avatar'
      _exceptionValidate.value = file
      _exceptionValidate.message = `Avatar not found`
      throw new NotFoundException(_exceptionValidate)
    }
    const user = await this._userService.findOneById(id)

    if (!user) {
      const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
      _exceptionValidate.field = 'id'
      _exceptionValidate.value = id
      _exceptionValidate.message = `User not found`
      throw new NotFoundException(_exceptionValidate)
    }
    this._userService.updateStatus(user.id, false)
    let _responseService, file_name
    if (!user.uploads) {
      const newPath = await this._uploadService.updateAvatar({
        user,
        file_name: file.filename
      })
      _responseService = await this._uploadService.insertFirst({ file_name: newPath, user_id: user.id })
      this._uploadService.updateStatus(_responseService.id, false)
      file_name = _responseService.name
    } else {
      const upload = await this._uploadService.findOneById(user.uploads.id)
      const newPath = await this._uploadService.uploadAvatar({
        user,
        file_name: file.filename,
        old_avatar: upload.name
      })
      _responseService = await this._uploadService.update(upload.id, newPath)
      this._uploadService.updateStatus(_responseService.id, false)
      const actionDeleteFaces = {
        version: TopicsAIModelFaceRegTrigger.VERSION,
        msg_timestamp: new Date(),
        action: TopicsAIModelFaceRegTrigger.ACTION_DELETE_FACES,
        folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
        list_file_path: [_responseService.name]
      }
      this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionDeleteFaces))
      this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionDeleteFaces)}`)
      file_name = _responseService.name
    }

    const emitFaceRegTrigger = [
      {
        file_name: file.filename,
        original_name: file.originalname,
        file_path: TopicsAIModelFaceRegTrigger.FOLDER_PATH + '/' + file_name,
        status: false,
        id: _responseService.id
      }
    ]
    this._kafkaClient.emit(TopicsAIModelFaceDetTrigger.TOPICS_FACES_DET_TRIGGER, JSON.stringify(emitFaceRegTrigger))
    this._logger.log(`[${TopicsAIModelFaceDetTrigger.TOPICS_FACES_DET_TRIGGER}] ${JSON.stringify(emitFaceRegTrigger)}`)

    if (!_responseService) {
      throw new BadRequestException()
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseListJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'avatar',
      path: '/avatars',
      fileFilter: (request, file, callback) => {
        if (!new RegExp('(jpg|png|jpeg)$', 'i').test(file.mimetype)) {
          return callback(new BadRequestException('Format error'), false)
        }
        callback(null, true)
      },
      limits: {
        fileSize: Math.pow(1024, 2) * 5
      }
    })
  )
  public async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
      _exceptionValidate.field = 'avatar'
      _exceptionValidate.value = file
      _exceptionValidate.message = `Avatar not found`
      throw new NotFoundException(_exceptionValidate)
    }
    const _responseService = await this._uploadService.insertFirst({ file_name: file.filename, user_id: null })

    const emitFaceRegTrigger = [
      {
        file_name: file.filename,
        original_name: file.originalname,
        file_path: TopicsAIModelFaceRegTrigger.FOLDER_PATH + '/' + file.filename,
        status: false,
        id: _responseService.id
      }
    ]
    this._kafkaClient.emit(TopicsAIModelFaceDetTrigger.TOPICS_FACES_DET_TRIGGER, JSON.stringify(emitFaceRegTrigger))
    this._logger.log(`[${TopicsAIModelFaceDetTrigger.TOPICS_FACES_DET_TRIGGER}] ${JSON.stringify(emitFaceRegTrigger)}`)

    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete('avatar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseListJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async deleteAvatar(@Param('id') id: string) {
    const _uploadService = await this._uploadService.findOneById(id)
    if (!_uploadService) {
      throw new NotFoundException('Upload not found')
    }
    const result = await this._uploadService.delete(id)
    this._uploadService.unLinkImage({ file_name: result.name })
    return BaseServiceResponse.Ok(result)
  }

  @UseInterceptors(new RpcLoggingInterceptor())
  @EventPattern(TopicsAIModelFaceDetTrigger.TOPICS_FACES_DET_TRIGGER_MESSAGE)
  async AIModelFaceDetMessage(data: UploadModelDto.ValidatedUploadDto[]) {
    data.map((item) => this._uploadService.updateStatus(item.id, item.status))
    return BaseServiceResponse.Ok(null)
  }
}
