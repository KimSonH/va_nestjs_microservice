export class TransformResponseInterceptorDTO {
  public data: any | null

  public message: string | null

  public http_status: number

  public errors: string | Array<any> | object
}
