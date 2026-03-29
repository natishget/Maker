import { IsEmail, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateCompanyDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  tg_bot_token!: string;

  @IsNumber()
  @IsNotEmpty()
  tg_chat_id!: number;
}
