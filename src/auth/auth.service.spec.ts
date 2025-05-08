import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import {UnauthorizedException} from "@nestjs/common";

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: Partial<UsersService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockUsersService = {
      findByEmailOrUsername: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        roles: [],
      };

      (mockUsersService.findByEmailOrUsername as jest.Mock).mockResolvedValue(user);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        roles: user.roles,
      });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        roles: [],
      };

      (mockUsersService.findByEmailOrUsername as jest.Mock).mockResolvedValue(user);

      await expect(service.validateUser('test@example.com', 'wrongpass')).rejects.toThrow(
          UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (mockUsersService.findByEmailOrUsername as jest.Mock).mockResolvedValue(null);

      await expect(service.validateUser('notfound@example.com', 'password123')).rejects.toThrow(
          UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return signed JWT token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        roles: [{ name: 'ROLE_USER' }],
      };

      (mockJwtService.sign as jest.Mock).mockReturnValue('mocked-jwt-token');

      const result = await service.login(user);

      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
        roles: ['ROLE_USER'],
      });
    });
  });
});
