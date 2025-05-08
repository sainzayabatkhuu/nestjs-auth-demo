import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import {Test, TestingModule} from "@nestjs/testing";
import {RolesGuard} from "./roles.guard";

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest
                .fn()
                .mockResolvedValue({ sub: 'user123', username: 'testUser' }), // Mock JwtService's verifyAsync method
          },
        },
      ],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  const mockContext = (authorization?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization },
        }),
      }),
    } as ExecutionContext;
  };

  it('should allow access and set request user if token is valid', async () => {
    const mockPayload = { sub: 'user123', username: 'testUser' };
    jwtService.verify = jest.fn().mockResolvedValue(mockPayload);

    const context = mockContext('Bearer validToken');
    const canActivate = await jwtAuthGuard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    const context = mockContext(); // No authorization header

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jwtService.verifyAsync = jest
        .fn()
        .mockRejectedValue(new Error('Invalid token'));

    const context = mockContext('Bearer invalidToken');

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
    );
  });
});
