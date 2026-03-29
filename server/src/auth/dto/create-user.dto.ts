import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  position!: string;

  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
