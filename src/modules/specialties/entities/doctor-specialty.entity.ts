import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Doctor } from "../../users/entities/doctor.entity";
import { Specialty } from "./specialty.entity";

@Entity('doctorSpecialty')
export class DoctorSpecialty {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Doctor, doctor => doctor.specialties, { onDelete: 'CASCADE' })
    doctorId!: number;

    @ManyToOne(() => Specialty, specialty => specialty.doctors, { onDelete: 'CASCADE' })
    specialtyId!: number;
    
    @CreateDateColumn()
    assignAt!: Date;
}
