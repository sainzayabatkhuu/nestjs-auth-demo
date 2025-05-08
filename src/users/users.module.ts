import {Global, Module} from '@nestjs/common';
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Role} from "./role.entity";

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
