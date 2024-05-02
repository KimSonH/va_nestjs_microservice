import { Global, Module } from '@nestjs/common'
import { BaseRepositoryFactory } from './base.repository'
import { UserRepository } from './user.repository'
import { UploadRepository } from './upload.repository'
import { AuthenticationAdminRepository } from './authentication.admin.repository'
import { AdminRepository } from './admin.repository'
import { TokenRepository } from './token.repository'
import { AttendanceRepository } from './attendance.repository'
import { AttendanceTimeRepository } from './attendance.time.repository'
import { PrismaModule } from 'src/configuration/prisma/prisma.module'

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    BaseRepositoryFactory,
    UserRepository,
    UploadRepository,
    AuthenticationAdminRepository,
    AdminRepository,
    TokenRepository,
    AttendanceRepository,
    AttendanceTimeRepository
  ],
  exports: [
    UserRepository,
    UploadRepository,
    AuthenticationAdminRepository,
    AdminRepository,
    TokenRepository,
    AttendanceRepository,
    AttendanceTimeRepository
  ]
})
export class RepositoryModule {}
