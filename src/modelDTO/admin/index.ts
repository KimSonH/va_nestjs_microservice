import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { Admin, LANGUAGES } from '@prisma/client'
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export namespace AdminModelDto {
  export type AdminDto = Pick<Admin, 'id' | 'first_name' | 'email' | 'last_name' | 'language' | 'password' | 'camera'>

  export type AdminRequest = {
    user: AdminDto
  }

  export type AdminCreateDto = Pick<Admin, 'first_name' | 'last_name' | 'email' | 'password'>

  export class AdminProfileDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'first name', required: true })
    readonly first_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'last name', required: true })
    readonly last_name: string

    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'email', required: true })
    readonly email: string

    @IsNotEmpty()
    @IsEnum(LANGUAGES)
    @IsOptional()
    @ApiProperty({ description: 'language', required: false })
    readonly language: LANGUAGES

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({ description: 'camera', required: true })
    readonly camera: boolean
  }

  export type AdminValidatedGuard = Pick<Admin, 'id' | 'first_name' | 'last_name' | 'email'>

  export class AdminActionDto {
    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({ description: 'camera', required: true })
    readonly camera: boolean
  }

  export class AdminUpdateDto extends PartialType(AdminProfileDto) {}
}
