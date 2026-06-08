import { ApiProperty } from '@nestjs/swagger';
import { ReportPersonDto } from './report-person.dto';

export class ReportDoctorDto extends ReportPersonDto {
  @ApiProperty({ example: 'CRM 12345' })
  crm!: string;
}