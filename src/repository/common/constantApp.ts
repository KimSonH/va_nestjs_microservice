export default class AppConstants {
  public static readonly VERSION_APP: string = '1.0'
  public static readonly SWAGGER_TITLE: string = 'Backend Service'
  public static readonly SWAGGER_DESCRIPTION: string = 'Api user'

  public static readonly SERVICE_NAME: string = 'backend-service'

  public static readonly GLOBAL_PREFIX_API: string = 'api/v1'

  //=========================================================================================
  //========================          message response        ===============================
  //=========================================================================================
  public static readonly RESPONSE_MESSAGE_SUCCESS = 'Server Response Success'
  public static readonly RESPONSE_MESSAGE_BAD_REQUEST = 'Bad Request'
  public static readonly RESPONSE_MESSAGE_SERVER_ERROR = 'Server Internal Error'
  public static readonly USER_NOT_FOUND: string = 'Unable to get user from User Entity based on userAuthId'

  //=========================================================================================
  //========================          common paging            ==============================
  //=========================================================================================
  public static readonly DEFAULT_LIMIT_ALL: number = -1
  public static readonly DEFAULT_LIMIT: number = 10
  public static readonly DEFAULT_PAGE: number = 1
  public static readonly DEFAULT_TOTAL_PAGE: number = 1
  public static readonly DEFAULT_TOTAL_RECORD: number = 0

  //=========================================================================================
  //========================          common jwt               ==============================
  //=========================================================================================
  public static readonly KEY_JWT_PASSPORT_STRATEGY_CUSTOMER = 'jwt-customer'

  //=========================================================================================
  //========================          Prisma           ======================================
  //=========================================================================================
  public static readonly CONFIG_LOG_QUERY_PRISMA: Array<any> = [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' }
  ]
}
