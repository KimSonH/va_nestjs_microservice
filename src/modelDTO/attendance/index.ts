import { ApiProperty } from '@nestjs/swagger'
import { AttendanceTime } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, IsNumber, IsArray, IsObject, IsOptional, IsBoolean } from 'class-validator'
import { QueryPagingDTO } from '../common'

export namespace AttendanceModelDto {
  export class AIModelFaceRegDataObject {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'id', required: true })
    readonly id: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'label', required: true })
    readonly label: string

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'confidence', required: true })
    readonly confidence: number

    @IsNotEmpty()
    @IsArray()
    @Type(() => Number)
    @ApiProperty({ description: 'landmark', required: true, isArray: true })
    readonly landmark: number[]

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({ description: 'bbox', required: true })
    readonly bbox: { topleftx: number; toplefty: number; bottomrightx: number; bottomrighty: number }

    @IsOptional()
    @ApiProperty({ description: 'attribute', required: true })
    readonly attribute?: { [key: string]: { index: number; confidence: number } }
  }
  export class AIModelFaceRegData {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'version', required: true })
    readonly version: string

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'source id', required: true })
    readonly source_id: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'num frames in batch', required: true })
    readonly num_frames_in_batch: number

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ description: 'max frames in batch', required: true })
    readonly max_frames_in_batch: number

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'msg timestamp', required: true })
    readonly msg_timestamp: string

    @IsNotEmpty()
    @Type(() => AIModelFaceRegDataObject)
    @ApiProperty({ description: 'msg timestamp', required: true })
    readonly objects: AIModelFaceRegDataObject[]
  }

  export class AttendanceTimeDto
    implements Omit<AttendanceTime, 'id' | 'time' | 'created_at' | 'updated_at' | 'deleted_at' | 'status'> {}

  export class CreateAttendanceTimeDto extends AttendanceTimeDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'time', required: true })
    readonly time: string

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({ description: 'status', required: true })
    readonly status: boolean
  }

  export class QueryAllAttendanceDto extends QueryPagingDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'date time', required: false })
    readonly date_time?: string
  }
}
