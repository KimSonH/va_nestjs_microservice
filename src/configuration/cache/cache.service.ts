import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private _cacheManager: Cache) {}

  async get(key: any) {
    try {
      return await this._cacheManager.get(key)
    } catch (error) {
      throw new NotFoundException(`${key} not found`)
    }
  }

  async set(key: any, value: any) {
    try {
      await this._cacheManager.set(key, value, 86400 * 1000)
    } catch (error) {
      throw new BadRequestException()
    }
  }

  async reset() {
    try {
      await this._cacheManager.reset()
    } catch (error) {
      throw new BadRequestException()
    }
  }

  async del(key) {
    try {
      await this._cacheManager.del(key)
    } catch (error) {
      throw new BadRequestException()
    }
  }
}
