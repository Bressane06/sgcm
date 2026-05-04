import { IsNotEmpty, IsString } from "class-validator";

export class CreateSpecialtyDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome da especialidade é obrigatório' })
    name!: string;

    @IsString()
    @IsNotEmpty({ message: 'Descrição da especialidade é obrigatória' })
    description!: string;
}
