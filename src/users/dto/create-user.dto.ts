import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
import { UserStatus, Gender } from '../schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  emailVerified?: boolean;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsNotEmpty()
  @IsString()
  user_ns: string;

  @IsNotEmpty()
  @IsString()
  token_talkbi: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;
}
