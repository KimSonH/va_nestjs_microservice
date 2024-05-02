export default class AppConstants {
  public static readonly CONFIG_LOG_QUERY_PRISMA: Array<any> = [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' }
  ]
}
