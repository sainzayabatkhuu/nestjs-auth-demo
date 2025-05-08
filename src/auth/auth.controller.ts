import {Request, Body, Controller, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {AuthService} from "./auth.service";
import {Roles} from "./decorators/roles.decorator";
import {RolesGuard} from "./guards/roles.guard";

@Controller('v1/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        const user = await this.authService.validateUser(body.username, body.password);
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ROLE_USER')
    @Post('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
