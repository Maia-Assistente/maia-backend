// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Fazer login no sistema' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '675c123456789abcdef01234' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
            phone: { type: 'string', example: '11999999999' },
            cpf: { type: 'string', example: '123.456.789-00' },
            status: { type: 'string', example: 'active' },
            gender: { type: 'string', example: 'male' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas'
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '675c123456789abcdef01234' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@email.com' },
        phone: { type: 'string', example: '11999999999' },
        cpf: { type: 'string', example: '123.456.789-00' },
        status: { type: 'string', example: 'active' },
        gender: { type: 'string', example: 'male' },
        emailVerified: { type: 'boolean', example: false },
        createdAt: { type: 'string', example: '2025-09-06T18:00:00.000Z' },
        updatedAt: { type: 'string', example: '2025-09-06T18:00:00.000Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos'
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário com este email ou CPF já existe'
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }
}
