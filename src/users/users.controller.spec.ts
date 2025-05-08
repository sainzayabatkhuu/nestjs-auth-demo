import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {UsersService} from "./users.service";
import {JwtService} from "@nestjs/jwt";
import {User} from "./user.entity";

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      getAllUsers: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [JwtService, { provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        { id: 1, username: 'Alice' } as User,
        { id: 2, username: 'Bob' } as User,
      ];

      (usersService.getAllUsers as jest.Mock).mockResolvedValue(users);

      const result = await controller.getAllUsers(1, 10);
      expect(result).toEqual(users);
      expect(usersService.getAllUsers).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('createUser', () => {
    it('should call usersService.createUser with correct input', async () => {
      const mockRequest = { username: 'Charlie', password: '1234' };

      await controller.createUser(mockRequest);

      expect(usersService.createUser).toHaveBeenCalledWith(mockRequest);
    });
  });
});
