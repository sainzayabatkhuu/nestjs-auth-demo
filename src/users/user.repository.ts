import { DataSource } from 'typeorm';
import { User } from './user.entity';

export const UserRepository = (dataSource: DataSource) =>
    dataSource.getRepository(User).extend({
        async findWithRolesByEmail(email: string) {
            return this.findOne({
                where: { email },
                relations: ['roles'],
            });
        },
    });