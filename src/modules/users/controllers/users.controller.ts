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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { Public } from '../../../common/decorators/is-public.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Criar usuário', security: [] })
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  async findAll(@Query() query: FindUsersQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOne(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Inativar usuário' })
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(Number(id));
  }
}
