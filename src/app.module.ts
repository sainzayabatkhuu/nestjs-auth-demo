import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // your DB username
      password: 'HGkY4NuELm7gTkFR', // your DB password
      database: 'auth_demo', // your DB name
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // turn off in production!
    }),
    AuthModule,
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
