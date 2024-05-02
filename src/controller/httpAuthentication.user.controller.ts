import { HttpService } from '@nestjs/axios'
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
import { ConfigService } from '@nestjs/config'
import { ClientKafka } from '@nestjs/microservices'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AxiosError } from 'axios'
import { Response } from 'express'
import { catchError, firstValueFrom } from 'rxjs'
import { APP_CONSTANT } from 'src/helper/constant'
import { UserChangePasswordDto, UserModelDto } from 'src/modelDTO'
import { AuthenticationUserService } from 'src/service/authentication/authentication.user.service'
import { BaseServiceResponse, UseCaseResponse } from 'src/service/common'
import { JwtUserAuthGuard } from 'src/service/token/guard/jwt-user-auth.guard'
import { JwtUserRefreshAuthGuard } from 'src/service/token/guard/jwt-user-refresh-auth.guard'
import { UserAuthGuard } from 'src/service/token/guard/user-auth.guard'
import { UserService } from 'src/service/user/user.service'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'

@ApiTags('Common')
@Controller('user/authentication')
export class HttpAuthenticationUserController implements OnModuleInit, OnModuleDestroy {
  private _logger = new Logger(HttpAuthenticationUserController.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly _authenticationUserService: AuthenticationUserService,
    private readonly _baseRepo: UserService,
    private readonly _configService: ConfigService,
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
  @UseGuards(UserAuthGuard)
  @Bind(Request())
  public async login(
    request: UserModelDto.UserRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<UseCaseResponse> {
    const _responseService = await this._authenticationUserService.login(response, request.user)
    console.log('test', this._configService.get<string>('CHATBOT_API'))
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${this._configService.get<string>('CHATBOT_API')}/verify-vr/verify`,
          {
            language: _responseService.language,
            first_name: _responseService.first_name,
            last_name: _responseService.last_name,
            email: _responseService.email,
            organization_name: 'canvas'
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this._logger.error('error: ', error)
            throw 'An error happened!'
          })
        )
    )
    console.log('data', data)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtUserRefreshAuthGuard)
  @Get('refresh')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async refresh(
    request: UserModelDto.UserRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<UseCaseResponse> {
    const _responseService = await this._authenticationUserService.login(response, request.user)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtUserAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async logOut(_, @Res({ passthrough: true }) response: Response) {
    await this._authenticationUserService.logout(response)
    return BaseServiceResponse.Ok(null)
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtUserAuthGuard)
  @Get('profile')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getProfile(request: UserModelDto.UserRequest) {
    const _responseService = await this._authenticationUserService.validateUser(request.user.email)
    if (!_responseService) throw new UnauthorizedException()
    return BaseServiceResponse.Ok(_responseService)
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtUserAuthGuard)
  @Post('profile')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async postProfile(request: UserModelDto.UserRequest, @Body() body: UserModelDto.UserProfileDto) {
    const _responseService = await this._authenticationUserService.validateUser(request.user.email)

    if (!_responseService) {
      throw new BadRequestException()
    }

    const _updateResponseService = await this._authenticationUserService.update(request.user.id, body)

    if (!_updateResponseService) {
      throw new BadRequestException()
    }
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${this._configService.get<string>('CHATBOT_API')}/verify-vr/verify`,
          {
            language: _updateResponseService.language,
            first_name: _updateResponseService.first_name,
            last_name: _updateResponseService.last_name,
            email: _updateResponseService.email,
            organization_name: 'canvas'
          },
          { headers: { 'Content-Type': 'application/json' } }
        )
        .pipe(
          catchError((error: AxiosError) => {
            this._logger.error('error: ', error)
            throw 'An error happened!'
          })
        )
    )
    console.log('data', data)
    return BaseServiceResponse.Ok(_updateResponseService)
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtUserAuthGuard)
  @Post('change-password')
  @Bind(Request())
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async changePassword(request: UserModelDto.UserRequest, @Body() body: UserChangePasswordDto) {
    const _responseService = await this._authenticationUserService.validateUser(request.user.email)

    if (!_responseService) {
      throw new BadRequestException()
    }

    const validatedUser = await this._baseRepo.findOneEmail(request.user.email)
    if (!validatedUser) {
      throw new BadRequestException('Username or password does not exist')
    }

    const isComparePassword = await this._baseRepo.validateUser(validatedUser.password, body.currentPassword)

    if (isComparePassword === null) {
      throw new BadRequestException('Username or password does not exist')
    }
    const _updateResponseService = await this._authenticationUserService.changePassword(
      request.user.id,
      body.newPassword
    )

    if (!_updateResponseService) {
      throw new BadRequestException()
    }

    return BaseServiceResponse.Ok(_updateResponseService)
  }
}
