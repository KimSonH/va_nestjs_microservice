export * from './swaggerHandle'
export * from './exception'
export * from './jwtGenerate'
export * from './crypto'

export const generatePassword = (length) => {
  const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*_-+='

  const characters = alpha + numbers + symbols

  let password = ''
  for (let i = 0; i < length; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return password
}

export const parseCookies = (cookieString: string) => {
  return cookieString.split('; ').reduce((acc, current) => {
    const [name, value] = current.split('=')
    acc[name] = value
    return acc
  }, {}) // Notice the initial object here
}
