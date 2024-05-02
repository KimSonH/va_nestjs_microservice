import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtService } from '@nestjs/jwt'
import { CryptoLib, JwtGenerate } from 'src/utils'

@Module({
  providers: [AdminService, JwtService, JwtGenerate, CryptoLib],
  exports: [AdminService]
})
export class AdminModuleService {}
