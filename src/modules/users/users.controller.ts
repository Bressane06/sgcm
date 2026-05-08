import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @Get()
  async findAll(@Query() query: FindUsersQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOne(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(Number(id));
  }
}
