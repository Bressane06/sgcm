import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UserType } from '../users/enum/user-type.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiAuthResponses } from '../../common/swagger';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { ProcedureResponseDto } from './dto/procedure-response.dto';

@ApiAuthResponses({
  instance: '/procedures',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
@ApiTags('Procedures')
@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar procedimento por ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: ProcedureResponseDto })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.proceduresService.findOne(+id, user);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar procedimento',
    description:
      'Campos aceitos variam por tipo. Não é possível atualizar procedimento de atendimento FINISHED.',
  })
  @ApiOkResponse({ type: ProcedureResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Campo inválido para o tipo do procedimento.',
  })
  @ApiResponse({ status: 404, description: 'Procedimento não encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateProcedureDto: UpdateProcedureDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.update(+id, updateProcedureDto, user);
  }

  @Patch(':id/authorize')
  @ApiOperation({ summary: 'Autorizar procedimento especializado' })
  @ApiOkResponse({ type: ProcedureResponseDto })
  @ApiResponse({
    status: 400,
    description:
      'Procedimento não é SPECIALIZED, não requer autorização ou não está PENDING.',
  })
  authorizeProcedure(@Param('id') id: string) {
    return this.proceduresService.authorizeProcedure(+id);
  }

  @Patch(':id/deny')
  @ApiOperation({
    summary: 'Negar procedimento especializado',
    description:
      'A negação é definitiva — transição DENIED → PENDING não é permitida.',
  })
  @ApiOkResponse({ type: ProcedureResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Procedimento não é SPECIALIZED ou não está PENDING.',
  })
  denyProcedure(@Param('id') id: string) {
    return this.proceduresService.denyProcedure(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir procedimento' })
  @ApiResponse({ status: 204, description: 'Procedimento excluído.' })
  @ApiResponse({
    status: 409,
    description: 'Atendimento associado está FINISHED.',
  })
  remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.proceduresService.remove(+id, user);
  }
}
