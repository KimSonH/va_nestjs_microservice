import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

@Injectable()
export class httpModuleService {
  private readonly logger = new Logger(httpModuleService.name)

  constructor(private readonly httpService: HttpService) {}

  public async post(url, body) {
    try {
      this.logger.log(
        JSON.stringify({
          url,
          body
        }).toString()
      )
      const { data } = await firstValueFrom(
        this.httpService.post(url, body).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw 'An error happened!'
          })
        )
      )
      return data
    } catch (error) {
      throw error
    }
  }

  public async get(url, params) {
    try {
      this.logger.log(
        JSON.stringify({
          url,
          params
        }).toString()
      )
      const { data } = await firstValueFrom(
        this.httpService.get(url, { params: { ...params } }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw 'An error happened!'
          })
        )
      )
      return data
    } catch (error) {
      throw error
    }
  }
}
