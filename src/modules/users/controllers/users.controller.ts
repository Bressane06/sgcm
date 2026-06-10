import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserType } from '../enum/user-type.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { ApiAuthResponses, ApiWrappedResponse } from '../../../common/swagger';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { ProblemDetailsDto } from '../../../common/dto/problem-details.dto';

@ApiTags('Users')
@Controller('users')
@ApiAuthResponses({
  instance: '/users',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
@ApiExtraModels(CreateDoctorDto, CreatePatientDto, CreateUserDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserType.ADMIN)
  @ApiOperation({
    summary: 'Criar usuário',
    description:
      'Cria um novo usuário no sistema. O corpo da requisição varia conforme o campo "type".',
  })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateDoctorDto) },
        { $ref: getSchemaPath(CreatePatientDto) },
        { $ref: getSchemaPath(CreateUserDto) },
      ],
    },
  })
  @ApiWrappedResponse({
    description: 'Usuário criado com sucesso.',
    model: UserResponseDto,
    status: HttpStatus.CREATED,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou erro de validação.',
    content: {
      'application/json': {
        // Isso garante que a estrutura venha do DTO, mas o exemplo seja o real
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/validation-error',
          title: 'Erro de validação',
          status: 400,
          detail:
            'Um ou mais campos contêm valores inválidos. Verifique os detalhes.',
          instance: '/users',
          method: 'POST',
          timestamp: '2026-06-09T15:26:56.907Z',
          traceId: 'ff212577-5271-487d-88ea-4606eac8d653',
        },
      },
    },
  })
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiWrappedResponse({
    description: 'Lista de usuários retornada com sucesso.',
    model: UserResponseDto,
    isArray: true,
  })
  async findAll(@Query() query: FindUsersQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiWrappedResponse({
    description: 'Usuário encontrado com sucesso.',
    model: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/not-found',
          title: 'Recurso não encontrado',
          status: 404,
          detail: 'Não foi possível localizar o usuário com o ID informado.',
          instance: '/users/1',
          method: 'GET',
          timestamp: '2026-06-09T15:30:00.000Z',
          traceId: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
        },
      },
    },
  })
  async findOne(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.usersService.findOneWithAccess(Number(id), user);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiWrappedResponse({
    description: 'Usuário atualizado com sucesso.',
    model: UserResponseDto,
  })
  @ApiBadRequestResponse({ type: ProblemDetailsDto })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado para atualização.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/not-found',
          title: 'Erro ao atualizar',
          status: 404,
          detail: 'O usuário que você tenta atualizar não existe.',
          instance: '/users/1',
          method: 'PATCH',
          timestamp: '2026-06-09T15:35:00.000Z',
          traceId: 'b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7',
        },
      },
    },
  })
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
  async remove(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.usersService.removeWithAccess(Number(id), user);
  }
}
