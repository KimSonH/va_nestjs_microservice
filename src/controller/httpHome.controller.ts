import { Controller, Get, HttpCode, HttpStatus, Logger, Query, UseGuards } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { HomeModelDto } from 'src/modelDTO'
import { BaseServiceResponse } from 'src/service/common'
import { HomeService } from 'src/service/home/home.service'
import { JwtAdminAuthGuard } from 'src/service/token/guard/jwt-admin-auth.guard'
import { SwaggerHandle } from 'src/utils'
import { WardResponse } from 'src/utils/dto/swagger.dto'

@Controller('/home')
@UseGuards(JwtAdminAuthGuard)
export class HttpHomeController {
  private readonly logger = new Logger(HttpHomeController.name)

  constructor(private readonly _homeService: HomeService) {}

  @Get('chart')
  @HttpCode(HttpStatus.OK)
  @ApiResponse(SwaggerHandle.defaultResponseJSON({ json: WardResponse.responseExampleUser() }))
  @ApiResponse(SwaggerHandle.defaultResponseServiceError())
  public async report(@Query() reportQuery: HomeModelDto.reportQueryDto) {
    const _responseService = await this._homeService.getDataChart(reportQuery)
    return BaseServiceResponse.Ok(_responseService)
  }
}
