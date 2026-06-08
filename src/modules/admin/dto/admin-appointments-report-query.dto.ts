import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class AdminAppointmentsReportQueryDto {

    @ApiPropertyOptional({
        description: 'Data inicial do período (ISO 8601)',
        example: '2026-05-01T00:00:00.000Z'
    })
    @IsOptional()
    @IsString()
    startDate?: string;
    
    
    @ApiPropertyOptional({
        description: 'Data final do período (ISO 8601)',
        example: '2026-05-31T23:59:59.999Z'
    })
    @IsOptional()
    @IsString()
    endDate?: string;


}
