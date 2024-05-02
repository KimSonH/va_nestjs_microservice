import { BadRequestException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AdminModelDto } from 'src/modelDTO'
import { UserService } from 'src/service/user/user.service'

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user-auth') {
  constructor(private readonly _baseRepo: UserService) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string): Promise<AdminModelDto.AdminValidatedGuard> {
    const validatedUser = await this._baseRepo.findOneEmail(email)
    if (!validatedUser) {
      throw new BadRequestException('Wrong Username or password!')
    }

    const isComparePassword = await this._baseRepo.validateUser(validatedUser.password, password)

    if (isComparePassword === null) {
      throw new BadRequestException('Wrong Username or password!')
    }
    if (!validatedUser.status) throw new BadRequestException('Account has not been verified!')

    const { first_name, id, last_name } = validatedUser

    return { email, first_name, id, last_name }
  }
}
