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
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { IsPublic } from '../../common/decorators/is-public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @IsPublic()
  @ApiOperation({
    summary: 'Autenticar usuário com e-mail e senha',
    description: 'Retorna token de acesso e refresh token',
  })
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiOperation({
    summary: 'Renovar token de acesso com refresh token',
    description: 'Invalida o refresh token usado e emite um novo',
  })
  @ApiOkResponse({
    description: 'Token renovado com sucesso',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token inválido ou expirado',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retornar dados do usuário autenticado',
    description: 'Retorna dados completos do usuário, incluindo atributos específicos do perfil',
  })
  @ApiOkResponse({
    description: 'Dados do usuário autenticado retornados com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou expirado',
  })
  me(@CurrentUser() user: User) {
    return this.authService.me(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Encerrar sessão',
    description: 'Invalida o refresh token no banco',
  })
  @ApiOkResponse({
    description: 'Sessão encerrada com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou expirado',
  })
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}
