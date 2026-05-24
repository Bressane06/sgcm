import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/is-public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import type { UserPayload } from './models/user-payload.model';
import { ApiAuthResponses, ApiWrappedResponse } from '../../common/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @ApiOperation({
    summary: 'Autenticar usuário com e-mail e senha',
    description: `Autentica um usuário com e-mail e senha.
Retorna um token de acesso JWT de curta duração e um refresh token de longa duração.
O token de acesso deve ser enviado no cabeçalho Authorization: Bearer {token} em todas as requisições protegidas.
O refresh token deve ser armazenado pelo cliente e usado em POST /auth/refresh quando o token de acesso expirar.`,
  })
  @ApiBody({ type: LoginDto })
  @ApiWrappedResponse({
    description: 'Autenticação bem-sucedida.',
    model: AuthResponseDto,
    status: HttpStatus.OK,
    metaExample: {
      timestamp: '2026-05-24T09:00:00.000Z',
      path: '/auth/login',
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos.',
    schema: {
      example: {
        type: 'https://sgcm.example.com/problems/bad-request',
        title: 'Dados inválidos',
        status: 400,
        detail: 'O campo email deve ter um formato válido.',
        instance: '/auth/login',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais incorretas ou usuário inativo.',
    schema: {
      example: {
        type: 'https://sgcm.example.com/problems/unauthorized',
        title: 'Não autenticado',
        status: 401,
        detail: 'E-mail ou senha incorretos.',
        instance: '/auth/login',
      },
    },
  })
  login(@Body() _dto: LoginDto, @CurrentUser() user: User) {
    // note que o _dto serve para o swagger documentar os campos de entrada, mas o usuário autenticado já é injetado pelo LocalAuthGuard
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Renovar token de acesso com refresh token',
    description: `Renova o token de acesso usando um refresh token válido.
O refresh token utilizado é invalidado imediatamente e um novo refresh token é emitido.
Cada refresh token pode ser usado apenas uma vez.`,
  })
  @ApiWrappedResponse({
    description: 'Token renovado com sucesso.',
    model: AuthResponseDto,
    status: HttpStatus.OK,
    metaExample: {
      timestamp: '2026-05-24T09:00:00.000Z',
      path: '/auth/refresh',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido, expirado ou já utilizado.',
    schema: {
      example: {
        type: 'https://sgcm.example.com/problems/unauthorized',
        title: 'Não autenticado',
        status: 401,
        detail: 'O refresh token fornecido é inválido ou já foi utilizado.',
        instance: '/auth/refresh',
      },
    },
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiAuthResponses({
    instance: '/auth/me',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
    includeForbidden: false,
  })
  @ApiOperation({
    summary: 'Retornar dados do usuário autenticado',
    description: 'Retorna dados completos do usuário, incluindo atributos específicos do perfil',
  })
  @ApiWrappedResponse({
    description: 'Dados do usuário autenticado retornados com sucesso.',
    model: UserResponseDto,
    status: HttpStatus.OK,
    metaExample: {
      timestamp: '2026-05-24T09:00:00.000Z',
      path: '/auth/me',
    },
  })
  me(@CurrentUser() user: UserPayload) {
    return this.authService.me(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiAuthResponses({
    instance: '/auth/logout',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
    includeForbidden: false,
  })
  @ApiOperation({
    summary: 'Encerrar sessão',
    description: 'Invalida o refresh token no banco',
  })
  logout(@CurrentUser() user: UserPayload) {
    return this.authService.logout(user.sub);
  }
}
