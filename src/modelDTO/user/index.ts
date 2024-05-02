import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'
import { QueryPagingDTO } from '../common'
import { LANGUAGES, User } from '@prisma/client'
import { Type } from 'class-transformer'
import { UploadModelDto } from '../upload'
export namespace UserModelDto  {
  export type UserRequest = Request & {
    user: Pick<User, 'id' | 'first_name' | 'email' | 'last_name' | 'language' | 'password'>
  }

  export type UserValidatedGuard = Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>
  export class UserDto
    implements
      Omit<
        User,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'password'
        | 'avatar'
        | 'is_email_confirmed'
        | 'google_id'
        | 'email_login'
        | 'status'
      >
  {
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
  }

  export class CreateUserDto extends UserDto {
    @ValidateNested()
    @ApiProperty({ description: 'upload', required: true })
    readonly uploads?: UploadModelDto.UploadDto

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'status', required: true })
    readonly status?: boolean
  }

  export class QueryAllUserDto extends QueryPagingDTO {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'search', required: true })
    readonly search: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'status', required: true })
    readonly status?: boolean
  }

  export class UpdateUserDto extends CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'id', required: true })
    readonly id: string
  }

  export class UserIdManyDto {
    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({ description: 'id', required: true, isArray: true })
    readonly id: string[]
  }

  export class CreateUserManyDto {
    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({ description: 'avatar', required: true, isArray: true })
    @IsOptional()
    readonly avatar?: string[]

    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({ description: 'email', required: true, isArray: true })
    readonly email: string[]

    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({ description: 'first name', required: true, isArray: true })
    readonly first_name: string[]

    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({ description: 'last name', required: true, isArray: true })
    readonly last_name: string[]

    @IsNotEmpty()
    @IsOptional()
    @Type(() => String)
    @ApiProperty({ description: 'language', required: true, isArray: true })
    readonly language: string[]
  }

  export class ValidatedUserDto extends UserDto {
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

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({ description: 'status', required: true })
    readonly status: boolean
  }

  export class UpdateValidatedUserDto extends ValidatedUserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'id', required: true })
    readonly id: string
  }

  export class UserWithIdDto extends UserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'id', required: true })
    readonly id: string
  }

  export class UpdateUserManyDto extends CreateUserManyDto {
    @IsNotEmpty()
    @Type(() => String)
    @ApiProperty({ description: 'id', required: true, isArray: true })
    readonly id: string[]
  }

  export type UserRegisterNotificationDto = Pick<
    User,
    'id' | 'first_name' | 'email' | 'last_name' | 'language' | 'password'
  >

  export class UserProfileDto {
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
  }
}

export class UserChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Current Password', required: true })
  readonly currentPassword: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'New Password', required: true })
  readonly newPassword: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Confirm Password', required: true })
  readonly confirmPassword: string
}
