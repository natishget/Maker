import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginAdminDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
