import { Injectable } from '@nestjs/common';
import {User} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Role} from "./role.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) {}

    async findByEmailOrUsername(email: string): Promise<User | null> {
        return this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .where('user.email = :email OR user.username = :email', {
                email,
            })
            .getOne();
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({ relations: ['roles'] });
    }

    async getAllUsers(page: number, size: number): Promise<User[]> {
        const [users] = await this.usersRepository.findAndCount({
            skip: (page - 1) * size,
            take: size,
            relations: ['roles'], // include roles if needed
        });
        return users;
    }

    async createUser(body: any): Promise<User> {
        const { username, email, password, roles } = body;
        const role = await this.rolesRepository.findOne({
            where: { name: 'ROLE_USER' },
        });

        const user = new User();
        user.username = username;
        user.email = email;
        user.password = await bcrypt.hash(password, 10);
        user.activationKey = 'test123';
        user.isActive = true;
        user.roles = [role];

        return await this.usersRepository.save(user);
    }
}
