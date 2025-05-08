import { RolesGuard } from './roles.guard';
import {Reflector} from "@nestjs/core";
import {ExecutionContext, ForbiddenException} from "@nestjs/common";

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  function createMockContext(userRoles: string[] = [], requiredRoles: string[] | undefined = []) {
    const mockRequest = {
      user: {
        roles: userRoles,
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return mockContext;
  }

  it('should not allow access when no roles are required', () => {
    const context = createMockContext(['ROLE_USER'], undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user has required role', () => {
    const context = createMockContext(['ROLE_ADMIN'], ['ROLE_ADMIN']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    const context = createMockContext(['ROLE_USER'], ['ROLE_ADMIN']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny access when user has no roles', () => {
    const context = createMockContext([], ['ROLE_ADMIN']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
