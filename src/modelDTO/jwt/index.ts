import { CookieOptions } from 'express'

export namespace JwtModelDto {
  export class PayloadJwt {
    public email: string
    public first_name: string
    public last_name: string
  }

  export class AccessTokenForCookie {
    public access_token: string
    public options: CookieOptions
  }

  export class RefreshTokenForCookie {
    public refresh_token: string
    public options: CookieOptions
  }
}
