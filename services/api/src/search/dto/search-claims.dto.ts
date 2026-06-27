import {
  IsArray,
  IsNumber,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';

export class SearchClaimsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1536)
  @ArrayMaxSize(1536)
  embedding!: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
