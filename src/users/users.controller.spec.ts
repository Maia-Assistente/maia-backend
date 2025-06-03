import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Gender, UserStatus } from './schemas/user.schema';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

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
    emailVerified: false
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserNsAndToken: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
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

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByUserNsAndToken', () => {
    it('should return a user by user_ns and token_talkbi', async () => {
      const user_ns = 'namespace1';
      const token_talkbi = 'token123';
      mockUsersService.findByUserNsAndToken.mockResolvedValue(mockUser);

      const result = await controller.findByUserNsAndToken(
        user_ns,
        token_talkbi
      );

      expect(service.findByUserNsAndToken).toHaveBeenCalledWith(
        user_ns,
        token_talkbi
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const user_ns = 'namespace1';
      const token_talkbi = 'token123';
      mockUsersService.findByUserNsAndToken.mockResolvedValue(null);

      await expect(
        controller.findByUserNsAndToken(user_ns, token_talkbi)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe'
      };
      const updatedUser = { ...mockUser, name: 'Jane Doe' };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });
});
