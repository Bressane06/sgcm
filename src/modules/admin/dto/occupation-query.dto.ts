import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString } from "class-validator";

export class OccupationQueryDto{

    @ApiProperty({ example : '2026-05-05'})
    @IsDateString()
    startDate!: string;

    @ApiProperty({ example : '2026-06-05'})
    @IsDateString()
    endDate!: string;

}