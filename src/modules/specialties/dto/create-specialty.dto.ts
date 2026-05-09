import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class    CreateSpecialtyDto {
    @ApiProperty({
        description: 'Nome da especialidade',
        example: 'Cardiologia'
    })
    @IsString()
    @IsNotEmpty({ message: 'Nome da especialidade é obrigatório' })
    name!: string;

    @ApiProperty({
        description: 'Descrição da especialidade',
        example: 'Especialista em problemas cardíacos'
    })
    @IsString()
    @IsNotEmpty({ message: 'Descrição da especialidade é obrigatória' })
    description!: string;
}
