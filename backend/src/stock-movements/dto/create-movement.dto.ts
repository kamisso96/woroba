import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @IsString()
  productId: string;

  @IsEnum(MovementType)
  type: MovementType; // IN | OUT | ADJUSTMENT

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
