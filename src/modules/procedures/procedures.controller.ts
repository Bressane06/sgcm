import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UserType } from '../users/enum/user-type.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiAuthResponses } from '../../common/swagger';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';

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
  findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.proceduresService.findOne(+id, user);
  }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() updateProcedureDto: UpdateProcedureDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.update(+id, updateProcedureDto, user);
  }

  @Patch(':id/authorize')
  @Roles(UserType.ADMIN)
  authorizeProcedure(@Param('id') id: string) {
    return this.proceduresService.authorizeProcedure(+id);
  }

  @Patch(':id/deny')
  @Roles(UserType.ADMIN)
  denyProcedure(@Param('id') id: string) {
    return this.proceduresService.denyProcedure(+id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.remove(+id, user);
  }
}
