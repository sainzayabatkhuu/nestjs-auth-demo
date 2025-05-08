import {Controller, Request, Get, UseGuards, Post, HttpCode, HttpStatus, Body, Query} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {User} from "./user.entity";
import {UsersService} from "./users.service";
import {AuthGuard} from "@nestjs/passport";
import {Roles} from "../auth/decorators/roles.decorator";
import {RolesGuard} from "../auth/guards/roles.guard";

@Controller('/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Roles('ROLE_ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async getAllUsers(
        @Query('page') page: number = 1,
        @Query('size') size: number = 10
    ): Promise<User[]> {
        return this.usersService.getAllUsers( page, size );
    }

    @Roles('ROLE_ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() userRequest: any): Promise<void> {
        await this.usersService.createUser(userRequest);
    }
}
