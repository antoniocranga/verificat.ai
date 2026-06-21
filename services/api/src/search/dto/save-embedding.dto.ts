import {
  IsUUID,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class SaveEmbeddingDto {
  @IsUUID(4, { message: 'claimId must be a valid UUID v4' })
  claimId!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1536)
  @ArrayMaxSize(1536)
  embedding!: number[];
}
