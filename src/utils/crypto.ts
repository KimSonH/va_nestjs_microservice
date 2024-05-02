import { Injectable } from '@nestjs/common'
import * as cryptoLib from 'crypto-ts'
import * as bcrypt from 'bcrypt'

@Injectable()
export class CryptoLib {
  private _secretKey = 'va2023'
  private _soldPasswordService = 10

  public async encryptCrypto(text: string) {
    const _textEncrypt = await cryptoLib.AES.encrypt(text, this._secretKey).toString()

    return _textEncrypt
  }

  public async decryptCrypto(text: string) {
    const bytes = cryptoLib.AES.decrypt(text, this._secretKey)
    const plaintext = bytes.toString(cryptoLib.enc.Utf8)

    return plaintext
  }

  public async generatorPassword(password: string, soldPassword?: number): Promise<string> {
    const saltOrRounds = soldPassword ? soldPassword : this._soldPasswordService
    const hashingPassword = bcrypt.hash(password.trim(), saltOrRounds)

    return hashingPassword
  }

  /**
   *  @title Compare password
   *  @param body {password: string, hasPassword: string} compare
   *  @field password - password request body
   *  @field hasPassword - password query customer by username
   *  @returns {boolean}
   */
  public async comparePassword(password: string, hasPassword: string): Promise<boolean> {
    if (!password || !hasPassword) {
      return false
    }

    const compareBcrypt = await bcrypt.compare(password.trim(), hasPassword.trim())

    return compareBcrypt
  }
}
