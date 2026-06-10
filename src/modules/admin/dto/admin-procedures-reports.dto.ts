import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../../procedures/enum/procedure-type.enum';
import { AuthorizationStatus } from '../../procedures/enum/authorization-status.enum';
import { ComplexityLevel } from '../../procedures/enum/complexity-level.enum';

export class AdminProceduresReportDto {
  @ApiProperty({
    example: {
      SIMPLE: 12,
      SPECIALIZED: 8,
    },
  })
  byType: Record<ProcedureType, number>;

  @ApiProperty({
    example: {
      PENDING: 2,
      AUTHORIZED: 5,
      DENIED: 1,
    },
  })
  byAuthorizationStatus: Record<AuthorizationStatus, number>;

  @ApiProperty({
    example: {
      LOW: 3,
      MEDIUM: 2,
      HIGH: 3,
    },
  })
  byComplexityLevel: Record<ComplexityLevel, number>;
}
