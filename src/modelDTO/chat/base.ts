import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class QueryMessageIdEndDTO {
  @IsOptional()
  @ApiProperty({ description: 'message Id', required: false })
  readonly last_id?: string
}
