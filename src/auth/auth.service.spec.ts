import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+5511999999999',
    cpf: '12345678901',
    status: 'active',
    user_ns: 'namespace1',
    token_talkbi: 'token123',
    gender: 'male',
    emailVerified: false
  };

  const mockUsersService = {
    validateUser: jest.fn(),
    findOne: jest.fn()
  };

  const mockJwtService = {
    sign: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123'
      };

      const accessToken = 'jwt.access.token';

      mockUsersService.validateUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(usersService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id
      });
      expect(result).toEqual({
        access_token: accessToken,
        user: mockUser
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(usersService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });
  });

  describe('validateUser', () => {
    it('should return user when payload is valid', async () => {
      const payload = { sub: '507f1f77bcf86cd799439011' };

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(payload);

      expect(usersService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUser);
    });
  });
});
