import { IsString, MinLength } from 'class-validator';

export class CreateAdminAuthDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
