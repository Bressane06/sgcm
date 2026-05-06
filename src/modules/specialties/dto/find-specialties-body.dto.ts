import { PartialType } from "@nestjs/swagger";
import { CreateSpecialtyDto } from "./create-specialty.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class FindSpecialtiesBodyDto extends PartialType(CreateSpecialtyDto) {
    @IsString()
    @IsNotEmpty()
    name!: string;
}