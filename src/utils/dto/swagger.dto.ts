export class WardResponse {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
  avatar: string

  constructor() {
    this.id = this.id ?? null
    this.email = this.email === null ? null : this.email
    this.first_name = this.first_name ?? null
    this.last_name = this.last_name ?? null
    this.avatar = this.avatar ?? null
    this.created_at = this.created_at ?? null
    this.updated_at = this.updated_at ?? null

    return this
  }

  static responseExampleUser() {
    const response = new WardResponse()
    response.id = 'id'
    response.email = 'Email Test'
    response.first_name = 'First Name Test'
    response.last_name = 'Last Name Test'
    response.avatar = 'Avatar Test'
    response.created_at = 'created_at'
    response.updated_at = 'updated_at'

    return response
  }
}
