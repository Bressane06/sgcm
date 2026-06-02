import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ReportStatus } from '../enum/report-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class FindReportsQueryDto extends PaginationQueryDto{

    @ApiPropertyOptional({
        enum: ReportStatus,
        example: ReportStatus.ACTIVE,
        description: 'Filtra laudos pelo status',
    })
    @IsOptional()
    @IsEnum(ReportStatus)
    status?: ReportStatus;
}