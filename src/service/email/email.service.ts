import { Injectable } from '@nestjs/common'
import { createTransport } from 'nodemailer'
import * as Mail from 'nodemailer/lib/mailer'
import { ConfigService } from '@nestjs/config'
// import Logo from 'src/asset/image/Logo.png'
import { UserModelDto } from 'src/modelDTO'
import { RegisterNotification } from 'src/assets/templates'

//
// import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class EmailService {
  // private nodemailerTransport: MailerService
  private nodemailerTransport: Mail

  constructor(private readonly configService: ConfigService) {
    this.nodemailerTransport = createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get('EMAIL_PORT'),
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD')
      }
    })
  }

  sendMail(options: Mail.Options) {
    const mailOptions = {
      ...options,
      from: `${this.configService.get('EMAIL_FROM_NAME')} <${this.configService.get('EMAIL_FROM')}>`
    }

    return this.nodemailerTransport.sendMail(mailOptions)
  }

  async sendRegisterSuccess(user: UserModelDto.UserRegisterNotificationDto) {
    const email = user.email

    return this.sendMail({
      to: email,
      subject: `Account created success- ${email}`,
      html: RegisterNotification(user)
    })
  }
}
