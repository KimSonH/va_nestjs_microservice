import { ApiProperty } from '@nestjs/swagger'
import { Upload, User } from '@prisma/client'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { QueryPagingDTO } from '../common'

export namespace UploadModelDto {
  export class CreateImageDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'height', required: true })
    readonly height: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'width', required: true })
    readonly width: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'x', required: true })
    readonly x: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'y', required: true })
    readonly y: string
  }

  export class ImageServiceDto {
    @IsNotEmpty()
    readonly user: User

    @IsNotEmpty()
    @IsString()
    readonly file_name: string
  }

  export class QueryAllUploadDto extends QueryPagingDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'search', required: true })
    readonly search: string

    @IsOptional()
    @ApiProperty({ description: 'ids', required: true })
    readonly ids?: string[]
  }

  export class UploadDto implements Omit<Upload, 'created_at' | 'updated_at' | 'deleted_at'> {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'id', required: true })
    readonly id: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'name', required: true })
    readonly name: string

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'user id', required: true })
    readonly user_id: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'status', required: true })
    readonly status: boolean
  }

  export class ValidatedUploadDto extends UploadDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'file name', required: true })
    readonly file_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'original name', required: true })
    readonly original_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'file path', required: true })
    readonly file_path: string
  }
}
