import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {AuthService} from "./auth.service";
import {JwtService} from "@nestjs/jwt";
import {UnauthorizedException} from "@nestjs/common";

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [JwtService, { provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const mockUser = { id: 1, username: 'john' };
      const mockToken = { access_token: 'jwt_token' };

      (mockAuthService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (mockAuthService.login as jest.Mock).mockResolvedValue(mockToken);

      const result = await controller.login({ username: 'john', password: 'changeme' });

      expect(result).toEqual(mockToken);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('john', 'changeme');
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException if user is not valid', async () => {
      (mockAuthService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(
          controller.login({ username: 'invalid', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const mockRequest = {
        user: { id: 1, username: 'john', roles: ['ROLE_USER'] },
      };

      const result = controller.getProfile(mockRequest as any);

      expect(result).toEqual(mockRequest.user);
    });
  });
});
