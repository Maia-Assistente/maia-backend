import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User, UserDocument, UserStatus, Gender } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    phone: '+5511999999999',
    cpf: '12345678901',
    status: UserStatus.ACTIVE,
    user_ns: 'namespace1',
    token_talkbi: 'token123',
    gender: Gender.MALE,
    emailVerified: false,
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
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
    })
  };

  const mockUserModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
    save: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
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

      const mockCreatedUser = {
        ...createUserDto,
        password: 'hashedpassword',
        save: jest.fn().mockResolvedValue({
          ...mockUser,
          ...createUserDto,
          password: 'hashedpassword'
        })
      };

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);

      // Mock the model constructor
      jest
        .spyOn(model, 'constructor' as any)
        .mockImplementation(() => mockCreatedUser);
      mockUserModel.constructor.mockImplementation(() => mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockCreatedUser.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException on duplicate key error', async () => {
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

      const duplicateError = { code: 11000 };
      const mockCreatedUser = {
        save: jest.fn().mockRejectedValue(duplicateError)
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword' as never);
      jest
        .spyOn(model, 'constructor' as any)
        .mockImplementation(() => mockCreatedUser);
      mockUserModel.constructor.mockImplementation(() => mockCreatedUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [mockUser];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(users)
      };

      mockUserModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser)
      };

      mockUserModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      };

      mockUserModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'john@example.com';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser)
      };

      mockUserModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const email = 'notfound@example.com';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null)
      };

      mockUserModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findByUserNsAndToken', () => {
    it('should return a user by user_ns and token_talkbi', async () => {
      const user_ns = 'namespace1';
      const token_talkbi = 'token123';

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser)
      };

      mockUserModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByUserNsAndToken(user_ns, token_talkbi);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        user_ns,
        token_talkbi
      });
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(service.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return null when credentials are invalid', async () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';

      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      const email = 'notfound@example.com';
      const password = 'password123';

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe'
      };
      const updatedUser = { ...mockUser, name: 'Jane Doe' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser)
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      const result = await service.update(userId, updateUserDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        { new: true }
      );
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        name: 'Jane Doe'
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw ConflictException on duplicate key error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com'
      };
      const duplicateError = { code: 11000 };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(duplicateError)
      };

      mockUserModel.findByIdAndUpdate.mockReturnValue(mockQuery);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser)
      };

      mockUserModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await service.remove(userId);

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null)
      };

      mockUserModel.findByIdAndDelete.mockReturnValue(mockQuery);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
