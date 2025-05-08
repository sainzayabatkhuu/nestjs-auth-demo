import {Global, Module} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {JwtModule} from "@nestjs/jwt";
import {AuthController} from "./auth.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/user.entity";
import {Role} from "../users/role.entity";
import {UsersService} from "../users/users.service";

@Global()
@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: 'secretKey',
            signOptions: { expiresIn: '100d' },
        }),
        TypeOrmModule.forFeature([User, Role]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
