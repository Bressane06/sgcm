import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AppointmentStatus } from "../../appointments/enum/appointment-status.enum";
import { Appointment } from "../../appointments/entities/appointment.entity";
import { AppointmentType } from "../../appointments/enum/appointment-type.enum";

export class AdminAppointmentsReportDto{

    @ApiProperty({
        description: 'Período do relatório',
        example: { startDate: '2024-01-01', endDate: '2024-12-31' },
    })
    period!: {
        startDate: string | null;
        endDate: string | null;
    }
    @ApiProperty({
        description: 'Total de atendimentos no período',
        example: 150,
    })
    total!: number;


    @ApiProperty({
    description: 'Totais por status',
    example: {
        IN_PROGRESS: 30,
        FINISHED: 120,
        },
    })
    byStatus!: Record<AppointmentStatus, number>;

    @ApiProperty({
        description: 'Totais por tipo',
        example: {
            CONSULTATION: 80,
            EXAM: 50,
            FOLLOW_UP: 20,
        },
    })
    byType!: Record<AppointmentType, number>;


}