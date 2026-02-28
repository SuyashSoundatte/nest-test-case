import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumberString()
  mobile!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNumberString()
  mobile?: string;

  @IsOptional()
  @IsString()
  name?: string;
}