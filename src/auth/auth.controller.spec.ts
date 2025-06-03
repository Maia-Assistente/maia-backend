import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Gender, UserStatus } from '../users/schemas/user.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  // Mock user with proper typing (including MongoDB _id)
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+5511999999999',
    cpf: '12345678901',
    status: UserStatus.ACTIVE,
    user_ns: 'namespace1',
    token_talkbi: 'token123',
    gender: Gender.MALE,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAuthService = {
    login: jest.fn()
  };

  const mockUsersService = {
    create: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: UsersService,
          useValue: mockUsersService
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123'
      };

      const loginResult = {
        access_token: 'jwt.access.token',
        user: mockUser
      };

      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResult);
      expect(result.access_token).toBeDefined();
      expect(result.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle service errors gracefully', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123'
      };

      const serviceError = new Error('Service temporarily unavailable');
      mockAuthService.login.mockRejectedValue(serviceError);

      await expect(controller.login(loginDto)).rejects.toThrow(serviceError);
    });

    it('should validate email format in login DTO', async () => {
      const invalidLoginDto = {
        email: 'invalid-email-format',
        password: 'password123'
      } as LoginDto;

      // This would be caught by the ValidationPipe in a real scenario
      // but we can test the controller behavior
      mockAuthService.login.mockResolvedValue({
        access_token: 'token',
        user: mockUser
      });

      await controller.login(invalidLoginDto);
      expect(authService.login).toHaveBeenCalledWith(invalidLoginDto);
    });

    it('should handle empty credentials', async () => {
      const emptyLoginDto: LoginDto = {
        email: '',
        password: ''
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );

      await expect(controller.login(emptyLoginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+5511999999999',
        cpf: '12345678901',
        user_ns: 'namespace1',
        token_talkbi: 'token123',
        gender: Gender.MALE
      };

      // Create expected result without password
      const createdUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+5511999999999',
        cpf: '12345678901',
        status: UserStatus.ACTIVE,
        user_ns: 'namespace1',
        token_talkbi: 'token123',
        gender: Gender.MALE,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.register(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should handle duplicate user registration', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
        phone: '+5511999999999',
        cpf: '12345678901',
        user_ns: 'namespace1',
        token_talkbi: 'token123',
        gender: Gender.MALE
      };

      const conflictError = new Error('User already exists');
      mockUsersService.create.mockRejectedValue(conflictError);

      await expect(controller.register(createUserDto)).rejects.toThrow(
        conflictError
      );
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should create user with all required fields', async () => {
      const completeUserDto: CreateUserDto = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'securepassword',
        phone: '+5511888888888',
        cpf: '98765432100',
        user_ns: 'jane_namespace',
        token_talkbi: 'jane_token',
        gender: Gender.FEMALE,
        status: UserStatus.ACTIVE,
        emailVerified: true
      };

      const createdUser = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+5511888888888',
        cpf: '98765432100',
        status: UserStatus.ACTIVE,
        user_ns: 'jane_namespace',
        token_talkbi: 'jane_token',
        gender: Gender.FEMALE,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.register(completeUserDto);

      expect(usersService.create).toHaveBeenCalledWith(completeUserDto);
      expect(result).toEqual(createdUser);
      expect(result.name).toBe(completeUserDto.name);
      expect(result.email).toBe(completeUserDto.email);
      expect(result.gender).toBe(completeUserDto.gender);
    });

    it('should handle validation errors', async () => {
      const invalidUserDto = {
        name: 'Test User'
        // Missing required fields
      } as CreateUserDto;

      const validationError = new Error('Validation failed');
      mockUsersService.create.mockRejectedValue(validationError);

      await expect(controller.register(invalidUserDto)).rejects.toThrow(
        validationError
      );
    });

    it('should create user with different genders', async () => {
      const testUsers = [
        {
          dto: {
            name: 'Male User',
            email: 'male@example.com',
            password: 'password123',
            phone: '+5511999999999',
            cpf: '11111111111',
            user_ns: 'male_ns',
            token_talkbi: 'male_token',
            gender: Gender.MALE
          },
          expected: {
            _id: '507f1f77bcf86cd799439013',
            name: 'Male User',
            email: 'male@example.com',
            phone: '+5511999999999',
            cpf: '11111111111',
            status: UserStatus.ACTIVE,
            user_ns: 'male_ns',
            token_talkbi: 'male_token',
            gender: Gender.MALE,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        {
          dto: {
            name: 'Female User',
            email: 'female@example.com',
            password: 'password123',
            phone: '+5511888888888',
            cpf: '22222222222',
            user_ns: 'female_ns',
            token_talkbi: 'female_token',
            gender: Gender.FEMALE
          },
          expected: {
            _id: '507f1f77bcf86cd799439014',
            name: 'Female User',
            email: 'female@example.com',
            phone: '+5511888888888',
            cpf: '22222222222',
            status: UserStatus.ACTIVE,
            user_ns: 'female_ns',
            token_talkbi: 'female_token',
            gender: Gender.FEMALE,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      ];

      for (const testUser of testUsers) {
        mockUsersService.create.mockResolvedValueOnce(testUser.expected);

        const result = await controller.register(testUser.dto);

        expect(result.gender).toBe(testUser.dto.gender);
        expect(result.name).toBe(testUser.dto.name);
      }
    });

    it('should handle different user statuses', async () => {
      const statusTests = [
        {
          dto: {
            name: 'Active User',
            email: 'active@example.com',
            password: 'password123',
            phone: '+5511999999999',
            cpf: '33333333333',
            user_ns: 'active_ns',
            token_talkbi: 'active_token',
            gender: Gender.MALE,
            status: UserStatus.ACTIVE
          },
          expectedStatus: UserStatus.ACTIVE
        },
        {
          dto: {
            name: 'Inactive User',
            email: 'inactive@example.com',
            password: 'password123',
            phone: '+5511888888888',
            cpf: '44444444444',
            user_ns: 'inactive_ns',
            token_talkbi: 'inactive_token',
            gender: Gender.FEMALE,
            status: UserStatus.INACTIVE
          },
          expectedStatus: UserStatus.INACTIVE
        }
      ];

      for (const test of statusTests) {
        const expectedUser = {
          _id: `507f1f77bcf86cd79943901${Math.floor(Math.random() * 10)}`,
          ...test.dto,
          status: test.expectedStatus,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        delete (expectedUser as any).password;

        mockUsersService.create.mockResolvedValueOnce(expectedUser);

        const result = await controller.register(test.dto);

        expect(result.status).toBe(test.expectedStatus);
      }
    });

    it('should handle unique constraint violations for compound index', async () => {
      const userDto: CreateUserDto = {
        name: 'Test User',
        email: 'unique@example.com',
        password: 'password123',
        phone: '+5511999999999',
        cpf: '55555555555',
        user_ns: 'existing_ns',
        token_talkbi: 'existing_token', // Combination already exists
        gender: Gender.MALE
      };

      const duplicateError = new Error(
        'Duplicate key error: user_ns and token_talkbi combination already exists'
      );
      mockUsersService.create.mockRejectedValue(duplicateError);

      await expect(controller.register(userDto)).rejects.toThrow(
        duplicateError
      );
    });
  });

  describe('edge cases', () => {
    it('should handle null responses from services', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password'
      };

      mockAuthService.login.mockResolvedValue(null);

      const result = await controller.login(loginDto);
      expect(result).toBeNull();
    });

    it('should handle undefined user data', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+5511999999999',
        cpf: '66666666666',
        user_ns: 'test_ns',
        token_talkbi: 'test_token',
        gender: Gender.MALE
      };

      mockUsersService.create.mockResolvedValue(undefined);

      const result = await controller.register(createUserDto);
      expect(result).toBeUndefined();
    });

    it('should handle service timeout scenarios', async () => {
      const loginDto: LoginDto = {
        email: 'timeout@example.com',
        password: 'password123'
      };

      const timeoutError = new Error('Request timeout');
      mockAuthService.login.mockRejectedValue(timeoutError);

      await expect(controller.login(loginDto)).rejects.toThrow(timeoutError);
    });
  });

  describe('integration with DTOs', () => {
    it('should work with minimum required fields for CreateUserDto', async () => {
      const minimalUserDto: CreateUserDto = {
        name: 'Minimal User',
        email: 'minimal@example.com',
        password: 'password123',
        phone: '+5511999999999',
        cpf: '77777777777',
        user_ns: 'minimal_ns',
        token_talkbi: 'minimal_token',
        gender: Gender.OTHER
      };

      const createdUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Minimal User',
        email: 'minimal@example.com',
        phone: '+5511999999999',
        cpf: '77777777777',
        status: UserStatus.ACTIVE, // Default value
        user_ns: 'minimal_ns',
        token_talkbi: 'minimal_token',
        gender: Gender.OTHER,
        emailVerified: false, // Default value
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.register(minimalUserDto);

      expect(result).toEqual(createdUser);
      expect(result.status).toBe(UserStatus.ACTIVE);
      expect(result.emailVerified).toBe(false);
    });

    it('should preserve optional fields when provided', async () => {
      const userWithOptionalFields: CreateUserDto = {
        name: 'Complete User',
        email: 'complete@example.com',
        password: 'password123',
        emailVerified: true,
        phone: '+5511999999999',
        cpf: '88888888888',
        status: UserStatus.LATE,
        user_ns: 'complete_ns',
        token_talkbi: 'complete_token',
        gender: Gender.FEMALE
      };

      const createdUser = {
        _id: '507f1f77bcf86cd799439014',
        name: 'Complete User',
        email: 'complete@example.com',
        phone: '+5511999999999',
        cpf: '88888888888',
        status: UserStatus.LATE,
        user_ns: 'complete_ns',
        token_talkbi: 'complete_token',
        gender: Gender.FEMALE,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.register(userWithOptionalFields);

      expect(result).toEqual(createdUser);
      expect(result.emailVerified).toBe(true);
      expect(result.status).toBe(UserStatus.LATE);
    });
  });
});
