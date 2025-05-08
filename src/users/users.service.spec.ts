import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {Repository} from "typeorm";
import {User} from "./user.entity";
import {Role} from "./role.entity";
import {getRepositoryToken} from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let rolesRepository: Partial<Record<keyof Repository<Role>, jest.Mock>>;

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
    };

    rolesRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(Role), useValue: rolesRepository },],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmailOrUsername', () => {
    it('should return a user by email or username', async () => {
      const mockUser = { id: 1, username: 'user', email: 'user@mail.com', roles: [] } as User;

      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };

      (usersRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findByEmailOrUsername('user@mail.com');
      expect(result).toEqual(mockUser);
      expect(qb.where).toHaveBeenCalledWith(
          'user.email = :email OR user.username = :email',
          { email: 'user@mail.com' }
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with roles', async () => {
      const mockUsers = [{ id: 1, roles: [] }] as User[];
      (usersRepository.find as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(usersRepository.find).toHaveBeenCalledWith({ relations: ['roles'] });
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [{ id: 1, roles: [] }] as User[];
      (usersRepository.findAndCount as jest.Mock).mockResolvedValue([mockUsers, 1]);

      const result = await service.getAllUsers(1, 10);
      expect(result).toEqual(mockUsers);
      expect(usersRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['roles'],
      });
    });
  });

  describe('createUser', () => {
    it('should create and return a new user', async () => {
      const body = {
        username: 'testuser',
        email: 'test@mail.com',
        password: 'password123',
        roles: ['ROLE_USER'],
      };

      const mockRole = { id: 1, name: 'ROLE_USER' } as Role;
      const hashedPassword = await bcrypt.hash(body.password, 10);

      (rolesRepository.findOne as jest.Mock).mockResolvedValue(mockRole);
      (usersRepository.save as jest.Mock).mockImplementation((user) => Promise.resolve(user));

      const result = await service.createUser(body);

      expect(result.username).toBe(body.username);
      expect(result.email).toBe(body.email);
      expect(result.roles).toEqual([mockRole]);
      expect(await bcrypt.compare(body.password, result.password)).toBe(true);
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });
});
