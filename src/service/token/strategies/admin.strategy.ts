import { BadRequestException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AdminModelDto } from 'src/modelDTO'
import { AdminService } from 'src/service/admin/admin.service'

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin-auth') {
  constructor(private readonly _baseAdminRepo: AdminService) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string): Promise<AdminModelDto.AdminValidatedGuard> {
    const validatedAdmin = await this._baseAdminRepo.findOneByEmail(email)
    if (!validatedAdmin) {
      throw new BadRequestException('Wrong Username or password!')
    }

    const isComparePassword = await this._baseAdminRepo.validateAdmin(validatedAdmin.password, password)

    if (isComparePassword === null) {
      throw new BadRequestException('Wrong Username or password!')
    }

    const { first_name, id, last_name } = validatedAdmin

    return { email, first_name, id, last_name }
  }
}
