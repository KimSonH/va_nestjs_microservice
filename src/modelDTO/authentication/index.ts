import { ApiProperty } from '@nestjs/swagger'
import { Admin } from '@prisma/client'
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export namespace AuthenticationModelDto {
  export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'email', required: true })
    readonly email: string

    @ApiProperty({ description: 'Password user login', example: 'admin123456', required: true })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(32)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,32}$)/, {
      message: 'Password requirements has not been reached'
    })
    @Matches(/^([a-zA-Z0-9@#\$%&?!]+)$/, {
      message: 'Special characters can be used for password'
    })
    readonly password: string
  }

  export class AdminRequest {
    user: Pick<Admin, 'id' | 'first_name' | 'last_name' | 'language' | 'email'>
  }
}
