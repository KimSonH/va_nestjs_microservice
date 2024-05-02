export namespace ExceptionModelDto {
  export class ResponseExceptionDTO {
    public data: any | null

    public message: string | null

    public http_status: number

    public errors: string | Array<any> | object
  }

  export class ResponseExceptionValidate {
    field: string
    message: string
    value?: any
  }
}
