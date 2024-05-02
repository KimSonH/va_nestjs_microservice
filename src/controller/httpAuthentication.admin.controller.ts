import {
  Bind,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  Request,
  Get,
  Body,
  UnauthorizedException,
  BadRequestException,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger
} from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { APP_CONSTANT } from 'src/helper/constant'
import { AdminModelDto } from 'src/modelDTO'
import { AuthenticationAdminService } from 'src/service/authentication/authentication.admin.service'
import { BaseServiceResponse, TopicsAIModelFaceRegControl, UseCaseResponse } from 'src/service/common'
import { AdminAuthGuard } from 'src/service/token/guard/admin-auth.guard'
import { JwtAdminAuthGuard } from 'src/service/token/guard/jwt-admin-auth.guard'
import { JwtAdminRefreshAuthGuard } from 'src/service/token/guard/jwt-admin-refresh-auth.guard'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'

@ApiTags('Common')
@Controller('admin/authentication')
export class HttpAuthenticationAdminController implements OnModuleInit, OnModuleDestroy {
  private _logger = new Logger(HttpAuthenticationAdminController.name)

  constructor(
    private readonly _authenticationAdminService: AuthenticationAdminService,
    @Inject(APP_CONSTANT.VA_KAFKA) private _kafkaClient: ClientKafka
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

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  @UseGuards(AdminAuthGuard)
  @Bind(Request())
  public async login(
    request: AdminModelDto.AdminRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<UseCaseResponse> {
    const _responseService = await this._authenticationAdminService.login(response, request.user)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminRefreshAuthGuard)
  @Get('refresh')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async refresh(
    request: AdminModelDto.AdminRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<UseCaseResponse> {
    const _responseService = await this._authenticationAdminService.login(response, request.user)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async logOut(_, @Res({ passthrough: true }) response: Response) {
    await this._authenticationAdminService.logout(response)
    return BaseServiceResponse.Ok(null)
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAdminAuthGuard)
  @Get('profile')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getProfile(request: AdminModelDto.AdminRequest) {
    const _responseService = await this._authenticationAdminService.validateAdmin(request.user.email)
    if (!_responseService) throw new UnauthorizedException()
    return BaseServiceResponse.Ok(_responseService)
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAdminAuthGuard)
  @Post('profile')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async postProfile(request: AdminModelDto.AdminRequest, @Body() body: AdminModelDto.AdminProfileDto) {
    const _responseService = await this._authenticationAdminService.validateAdmin(request.user.email)

    if (!_responseService) {
      throw new BadRequestException()
    }

    const _updateResponseService = await this._authenticationAdminService.update(request.user.id, body)

    if (!_updateResponseService) {
      throw new BadRequestException()
    }

    return BaseServiceResponse.Ok(_updateResponseService)
  }

  @HttpCode(HttpStatus.OK)
  @Post('create')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async create(@Body() body: AdminModelDto.AdminCreateDto) {
    const _responseService = await this._authenticationAdminService.create(body)

    if (!_responseService) {
      throw new BadRequestException()
    }

    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('face-reg-control')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  @Bind(Request())
  public async AImodelFaceRegControl(request: AdminModelDto.AdminRequest, @Body() body: AdminModelDto.AdminActionDto) {
    const _responseService = await this._authenticationAdminService.updateBy(request.user.id, { camera: body.camera })
    const faceRegControl = {
      version: TopicsAIModelFaceRegControl.VERSION,
      msg_timestamp: new Date(),
      action: body.camera ? 'start' : 'stop'
    }
    this._kafkaClient.emit(TopicsAIModelFaceRegControl.TOPICS_FACE_REG_CONTROL, JSON.stringify(faceRegControl))
    this._logger.log(`[${TopicsAIModelFaceRegControl.TOPICS_FACE_REG_CONTROL}] ${JSON.stringify(faceRegControl)}`)
    return BaseServiceResponse.Ok(_responseService)
  }
}
