import { Injectable } from '@nestjs/common'
import { CryptoLib } from 'src/utils'
import { Prisma } from '@prisma/client'
import { AdminRepository } from 'src/repository/admin.repository'

@Injectable()
export class AdminService {
  constructor(private readonly _baseAdminRepo: AdminRepository, private _cryptoLib: CryptoLib) {}

  private readonly _select: Prisma.AdminSelect = {
    id: true,
    email: true,
    language: true,
    first_name: true,
    last_name: true,
    password: true
  }

  public async findOneByEmail(email: string) {
    const result = await this._baseAdminRepo.queryFirst({
      where: { email },
      select: this._select
    })

    if (!result) {
      return null
    }

    return result
  }

  public async validateAdmin(adminPassword: string, password: string) {
    const isComparePassword = await this._cryptoLib.comparePassword(password, adminPassword)
    if (!isComparePassword) {
      return null
    }
    return
  }
}
