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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserType } from '../enum/user-type.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { ApiAuthResponses } from '../../../common/swagger';

@ApiTags('Users')
@Controller('users')
@ApiAuthResponses({
  instance: '/users',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Criar usuário' })
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar usuários' })
  async findAll(@Query() query: FindUsersQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async findOne(
    @Param('id') id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.usersService.findOneWithAccess(Number(id), user);
  }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.usersService.updateWithAccess(Number(id), dto, user);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Inativar usuário' })
  async remove(
    @Param('id') id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.usersService.removeWithAccess(Number(id), user);
  }
}
