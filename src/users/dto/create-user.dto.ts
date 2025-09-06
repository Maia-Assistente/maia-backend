// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, Gender } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'minhasenha123',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Se o email foi verificado',
    example: false,
    default: false
  })
  @IsOptional()
  emailVerified?: boolean;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '11999999999'
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'CPF do usuário',
    example: '123.456.789-00'
  })
  @IsNotEmpty()
  @IsString()
  cpf: string;

  @ApiPropertyOptional({
    description: 'Status do usuário',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    default: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Gênero do usuário',
    enum: Gender,
    example: Gender.MALE
  })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;
}
