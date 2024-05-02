import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class QueryPagingDTO {
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ description: 'Search page', required: false })
  readonly page?: number

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ description: 'Search page', required: false })
  readonly limit?: number
}

export enum TimeFilter {
  Date = 'Date',
  Month = 'Month',
  Year = 'Year',
  Total = 'Total'
}

export enum TypeChart {
  attendances = 'attendances'
}
