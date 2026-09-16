import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}