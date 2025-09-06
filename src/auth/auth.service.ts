import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.validateUser(
      loginDto.email,
      loginDto.password
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };

    try {
      // Debug: verificar se o payload está correto

      const token = this.jwtService.sign(payload);

      return {
        access_token: token,
        user: user
      };
    } catch (error) {
      console.error('❌ JWT Sign Error:', error.message);
      throw new UnauthorizedException('Error generating token');
    }
  }

  async validateUser(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      return null;
    }

    // Retorna o payload no formato esperado pelo UserPayload
    return {
      sub: user._id.toString(),
      email: user.email
    };
  }
}
