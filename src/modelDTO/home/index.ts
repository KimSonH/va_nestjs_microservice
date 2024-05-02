import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { TimeFilter } from '../common'

export namespace HomeModelDto {
  export class reportQueryDto {
    @IsNotEmpty()
    readonly filter: TimeFilter

    @IsOptional()
    @IsDateString({ strict: true })
    readonly dateStart: string | ''

    @IsOptional()
    @IsDateString({ strict: true })
    readonly dateEnd: string | ''

    @IsOptional()
    @IsNumber()
    readonly timeZone: number
  }
}
