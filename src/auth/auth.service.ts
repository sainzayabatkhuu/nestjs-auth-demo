import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmailOrUsername(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, roles: user.roles.map(r => r.name) };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
