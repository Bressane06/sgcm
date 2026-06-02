import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UserType } from '../users/enum/user-type.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiAuthResponses } from '../../common/swagger';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';

@ApiAuthResponses({
  instance: '/schedules',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
@Controller('')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @ApiTags('Appointments')
  @Post('appointments/:appointmentId/procedures')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  create(
    @Body() createProcedureDto: CreateProcedureDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.create(createProcedureDto, user); // implementar quando appointment for criado
  }

  @ApiTags('Appointments')
  @Get('appointments/:appointmentId/procedures')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  findAll(@CurrentUser() user: UserPayload) {
    return this.proceduresService.findAll(user); // implementar quando appointment for criado
  }

  @ApiTags('Procedure')
  @Get('procedures/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.proceduresService.findOne(+id, user);
  }

  @ApiTags('Procedure')
  @Put('procedures/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() updateProcedureDto: UpdateProcedureDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.update(+id, updateProcedureDto, user);
  }

  @ApiTags('Procedure')
  @Patch('procedures/:id/authorize')
  @Roles(UserType.ADMIN)
  authorizeProcedure(@Param('id') id: string) {
    return this.proceduresService.authorizeProcedure(+id);
  }

  @ApiTags('Procedure')
  @Patch('procedures/:id/deny')
  @Roles(UserType.ADMIN)
  denyProcedure(@Param('id') id: string) {
    return this.proceduresService.denyProcedure(+id);
  }

  @ApiTags('Procedure')
  @Delete('procedures/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  remove(@Param('id') id: string) {
    return this.proceduresService.remove(+id);
  }
}
