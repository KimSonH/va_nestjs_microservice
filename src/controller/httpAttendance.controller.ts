import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AttendanceModelDto, UserModelDto } from 'src/modelDTO'
import { AttendanceService } from 'src/service/attendance/attendance.service'
import { AttendanceTimeService } from 'src/service/attendance/attendance.time.service'
import { BaseServiceResponse } from 'src/service/common'
import { JwtAdminAuthGuard } from 'src/service/token/guard/jwt-admin-auth.guard'
import { JwtUserAuthGuard } from 'src/service/token/guard/jwt-user-auth.guard'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'

@ApiTags('Common')
@Controller('attendance')
export class HttpAttendanceController {
  constructor(
    private readonly _attendanceTimeService: AttendanceTimeService,
    private readonly _attendanceService: AttendanceService
  ) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post('time')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async create(@Body() body: AttendanceModelDto.CreateAttendanceTimeDto) {
    const _responseService = await this._attendanceTimeService.create(body)
    if (!_responseService) {
      return BaseServiceResponse.BadRequest(null, new BadRequestException().message)
    }
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('time')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getTime() {
    const _responseService = await this._attendanceTimeService.findOneByUserId()
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('time-status')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async statusTime(@Body() body: { status: boolean }) {
    const _responseService = await this._attendanceTimeService.updateStatus(body.status)
    return BaseServiceResponse.Ok(_responseService)
  }

  @UseGuards(JwtUserAuthGuard)
  @Get('/user')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getAttendancesOfUser(
    request: UserModelDto.UserRequest,
    @Query() query: AttendanceModelDto.QueryAllAttendanceDto
  ) {
    const user = request.user

    const _responseService = await this._attendanceService.findMany({ ...query, user_id: user.id })

    const _responseCustomService = _responseService.items.map((item) => ({
      ...item.user,
      attendances: {
        id: item.id,
        status: item.status,
        created_at: item.created_at
      }
    }))
    return BaseServiceResponse.Ok({
      ..._responseService,
      items: _responseCustomService
    })
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async getAttendances(@Query() query: AttendanceModelDto.QueryAllAttendanceDto) {
    const _responseService = await this._attendanceService.findMany(query)
    const _userService = await this._attendanceService.findManyUser({
      where: { deleted_at: { isSet: false }, status: true }
    })

    const _responseCustomService = _responseService.items.map((item) => ({
      ...item.user,
      attendances: {
        id: item.id,
        status: item.status,
        created_at: item.created_at
      }
    }))
    return BaseServiceResponse.Ok({
      ..._responseService,
      items: _responseCustomService,
      total_user_active: _userService.total_record
    })
  }
}
