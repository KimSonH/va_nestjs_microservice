import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Param,
  Patch,
  Inject,
  UseGuards,
  Delete,
  BadRequestException,
  OnModuleInit,
  NotFoundException,
  Logger,
  OnModuleDestroy
} from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { APP_CONSTANT } from 'src/helper/constant'
import { ExceptionModelDto, UserModelDto } from 'src/modelDTO'
import { BaseServiceResponse, TopicsAIModelFaceRegTrigger } from 'src/service/common'
import { EmailService } from 'src/service/email/email.service'
import { JwtAdminAuthGuard } from 'src/service/token/guard/jwt-admin-auth.guard'
import { UserService } from 'src/service/user/user.service'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'
@ApiTags('Common')
@Controller('/users')
export class HttpUserController implements OnModuleInit, OnModuleDestroy {
  private _logger = new Logger(HttpUserController.name)

  constructor(
    @Inject(APP_CONSTANT.VA_KAFKA) private _kafkaClient: ClientKafka,
    private readonly _userService: UserService,
    private readonly _emailService: EmailService
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
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async createUser(@Body() body: UserModelDto.CreateUserDto) {
    const _responseService = await this._userService.create(body)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseListJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getUsers(@Query() query: UserModelDto.QueryAllUserDto) {
    const _responseService = await this._userService.findMany(query)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getUser(@Param('id') id: string) {
    const _responseService = await this._userService.findOneById(id)
    if (!_responseService) {
      throw new NotFoundException('User not found')
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async updateUser(@Param('id') id: string, @Body() body: UserModelDto.UpdateUserDto) {
    const _userService = await this._userService.findOneById(id)
    if (!_userService) {
      throw new NotFoundException('User not found')
    }
    const _responseService = await this._userService.update(_userService.id, body)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async deleteUser(@Param('id') id: string) {
    const _userService = await this._userService.findOneById(id)
    if (!_userService) {
      throw new NotFoundException('User not found')
    }
    const _responseService = await this._userService.delete(_userService.id)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('create-many')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async createUserWithUploadMultiple(@Body() body: UserModelDto.CreateUserDto[]) {
    const _responseService = await body.reduce(
      async (acc: Promise<ExceptionModelDto.ResponseExceptionValidate[]>, createUser) => {
        const prev = await acc
        const isEmail = await this._userService.findOneEmail(createUser.email)
        if (isEmail) {
          this._userService.unlinkImage(createUser.uploads.id, createUser.uploads.name)
          const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
          _exceptionValidate.field = 'email'
          _exceptionValidate.value = createUser.email
          _exceptionValidate.message = `Email is already taken.`
          return [...prev, _exceptionValidate]
        }
        const user = await this._userService.create(createUser)
        await this._emailService.sendRegisterSuccess({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          language: user.language,
          password: user.password
        })
        this._userService.updateAvatar(createUser.uploads, user)

        return prev
      },
      Promise.resolve([]) as Promise<ExceptionModelDto.ResponseExceptionValidate[]>
    )
    if (_responseService.length) {
      throw new BadRequestException(_responseService)
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('update-many')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async updateUserWithUploadMultiple(@Body() body: UserModelDto.UpdateUserDto[]) {
    const _responseService = await body.reduce(
      async (acc: Promise<ExceptionModelDto.ResponseExceptionValidate[]>, updateUser) => {
        const prev = await acc
        const isUser = await this._userService.findOneById(updateUser.id)
        if (!isUser) {
          this._userService.unlinkImage(updateUser.uploads.id, updateUser.uploads.name)
          const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
          _exceptionValidate.field = 'id'
          _exceptionValidate.value = updateUser.id
          _exceptionValidate.message = `User not found.`
          return [...prev, _exceptionValidate]
        }
        const isEmail = await this._userService.findOneEmail(updateUser.email)
        if (isEmail.email !== updateUser.email) {
          this._userService.unlinkImage(updateUser.uploads.id, updateUser.uploads.name)
          const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
          _exceptionValidate.field = 'email'
          _exceptionValidate.value = updateUser.email
          _exceptionValidate.message = `Email is already taken.`
          return [...prev, _exceptionValidate]
        }
        this._userService.update(updateUser.id, updateUser)
        this._userService.updateStatus(updateUser.id, false)
        if (!updateUser.uploads.user_id) {
          if (isUser.uploads) {
            this._userService.unlinkImage(isUser.uploads.id, isUser.uploads.name)
          }
          this._userService.updateAvatar(updateUser.uploads, isUser)
        }

        return prev
      },
      Promise.resolve([]) as Promise<ExceptionModelDto.ResponseExceptionValidate[]>
    )
    const _userService = await this._userService.findManyUserId(body.map((item) => item.id))
    const deleteFaces = _userService.items.filter((item) => item.uploads && item.status)
    if (deleteFaces.length) {
      const actionDeleteFaces = {
        version: TopicsAIModelFaceRegTrigger.VERSION,
        msg_timestamp: new Date(),
        action: TopicsAIModelFaceRegTrigger.ACTION_DELETE_FACES,
        folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
        list_file_path: deleteFaces.map((item) => item.uploads.name)
      }
      this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionDeleteFaces))
      this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionDeleteFaces)}`)
    }
    if (_responseService.length) {
      throw new BadRequestException(_responseService)
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('get-many')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getManyUserById(@Body() body: UserModelDto.UserIdManyDto) {
    let validateUserExist = []
    const _userService = await this._userService.findManyUserId(body.id)
    body.id.map((item) => {
      if (!_userService.items.some((user) => user.id === item)) {
        const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
        _exceptionValidate.field = 'id'
        _exceptionValidate.value = item
        _exceptionValidate.message = `User not found`
        validateUserExist = [...validateUserExist, _exceptionValidate]
      }
    })
    if (validateUserExist.length) {
      throw new BadRequestException(validateUserExist)
    }
    return BaseServiceResponse.Ok(_userService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('delete-many')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async deleteManyUser(@Body() body: UserModelDto.UserIdManyDto) {
    const _userService = await this._userService.findManyUserId(body.id)
    const deleteFaces = _userService.items.filter((item) => item.uploads && item.status)
    if (deleteFaces.length) {
      const actionDeleteFaces = {
        version: TopicsAIModelFaceRegTrigger.VERSION,
        msg_timestamp: new Date(),
        action: TopicsAIModelFaceRegTrigger.ACTION_DELETE_FACES,
        folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
        list_file_path: deleteFaces.map((item) => item.uploads.name)
      }
      this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionDeleteFaces))
      this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionDeleteFaces)}`)
    }

    const _responseService = await body.id.reduce(
      async (acc: Promise<ExceptionModelDto.ResponseExceptionValidate[]>, id) => {
        const prev = await acc
        const isUser = await this._userService.findOneById(id)
        if (!isUser) {
          const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
          _exceptionValidate.field = 'id'
          _exceptionValidate.value = isUser.id
          _exceptionValidate.message = `User not found.`
          return [...prev, _exceptionValidate]
        }
        this._userService.delete(isUser.id)
        if (isUser.uploads) {
          this._userService.unlinkImage(isUser.uploads.id, isUser.uploads.name)
        }

        return prev
      },
      Promise.resolve([]) as Promise<ExceptionModelDto.ResponseExceptionValidate[]>
    )

    if (_responseService.length) {
      throw new BadRequestException(_responseService)
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('action-add-all')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async AIModelFaceRegTriggerAddAll() {
    const _userService = await this._userService.findMany({ limit: undefined, page: undefined, search: '' })
    const _userFilter = _userService.items.filter((user) => user.uploads && user.uploads.status)
    if (_userFilter.length) {
      this._userService.deleteUpload()
      this._userService.updateMany(
        _userFilter.map((item) => item.id),
        { status: true }
      )
      const actionAddAll = {
        version: TopicsAIModelFaceRegTrigger.VERSION,
        msg_timestamp: new Date(),
        action: TopicsAIModelFaceRegTrigger.ACTION_ADD_ALL,
        folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
        list_file_path: []
      }
      this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionAddAll))
      this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionAddAll)}`)
      return BaseServiceResponse.Ok(null)
    }
    return BaseServiceResponse.Ok(null)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('action-add-faces')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async AIModelFaceRegTriggerAddFaces(@Body() body: UserModelDto.UserIdManyDto) {
    this._userService.deleteUpload()
    const _userService = await this._userService.findManyUserId(body.id)
    const actionAddFaces = {
      version: TopicsAIModelFaceRegTrigger.VERSION,
      msg_timestamp: new Date(),
      action: TopicsAIModelFaceRegTrigger.ACTION_ADD_FACES,
      folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
      list_file_path: _userService.items.map((item) => {
        if (item.uploads && item.uploads.status) {
          return item.uploads.name
        }
      })
    }
    this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionAddFaces))
    this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionAddFaces)}`)
    const _responseService = await body.id.reduce(
      async (acc: Promise<ExceptionModelDto.ResponseExceptionValidate[]>, id) => {
        const prev = await acc
        const isUser = await this._userService.findOneById(id)
        if (!isUser) {
          const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
          _exceptionValidate.field = 'id'
          _exceptionValidate.value = isUser.id
          _exceptionValidate.message = `User not found.`
          return [...prev, _exceptionValidate]
        }
        this._userService.updateStatus(id, true)

        return prev
      },
      Promise.resolve([]) as Promise<ExceptionModelDto.ResponseExceptionValidate[]>
    )
    if (_responseService.length) {
      throw new BadRequestException(_responseService)
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('action-delete-all')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async AIModelFaceRegTriggerDeleteAll() {
    this._userService.deleteUpload()
    const _userService = await this._userService.findMany({ limit: undefined, page: undefined, search: '' })
    const _userFilter = _userService.items.filter((user) => user.status && user.uploads)
    if (_userFilter.length) {
      const actionDeleteAll = {
        version: TopicsAIModelFaceRegTrigger.VERSION,
        msg_timestamp: new Date(),
        action: TopicsAIModelFaceRegTrigger.ACTION_DELETE_ALL,
        folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
        list_file_path: []
      }
      this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionDeleteAll))
      this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionDeleteAll)}`)
      this._userService.updateMany(
        _userFilter.map((item) => item.id),
        { status: false }
      )
      _userFilter.map((item) => this._userService.unlinkImage(item.uploads.id, item.uploads.name))
    }
    return BaseServiceResponse.Ok(null)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('action-delete-faces')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async AIModelFaceRegTriggerDeleteFaces(@Body() body: UserModelDto.UserIdManyDto) {
    this._userService.deleteUpload()
    const _userService = await this._userService.findManyUserId(body.id)
    const actionDeleteFaces = {
      version: TopicsAIModelFaceRegTrigger.VERSION,
      msg_timestamp: new Date(),
      action: TopicsAIModelFaceRegTrigger.ACTION_DELETE_FACES,
      folder_path: TopicsAIModelFaceRegTrigger.ACTION_FOLDER_PATH,
      list_file_path: _userService.items.map((item) => {
        if (item.uploads) {
          return item.uploads.name
        }
      })
    }
    this._kafkaClient.emit(TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER, JSON.stringify(actionDeleteFaces))
    this._logger.log(`[${TopicsAIModelFaceRegTrigger.TOPICS_FACES_REG_TRIGGER}] ${JSON.stringify(actionDeleteFaces)}`)
    const _responseService = await body.id.reduce(
      async (acc: Promise<ExceptionModelDto.ResponseExceptionValidate[]>, id) => {
        const prev = await acc
        const isUser = await this._userService.findOneById(id)
        if (!isUser) {
          const _exceptionValidate = new ExceptionModelDto.ResponseExceptionValidate()
          _exceptionValidate.field = 'id'
          _exceptionValidate.value = isUser.id
          _exceptionValidate.message = `User not found.`
          return [...prev, _exceptionValidate]
        }
        this._userService.updateStatus(id, false)
        if (isUser.uploads) {
          this._userService.unlinkImage(isUser.uploads.id, isUser.uploads.name)
        }
        return prev
      },
      Promise.resolve([]) as Promise<ExceptionModelDto.ResponseExceptionValidate[]>
    )
    if (_responseService.length) {
      throw new BadRequestException(_responseService)
    }
    return BaseServiceResponse.Ok(_responseService)
  }
}
