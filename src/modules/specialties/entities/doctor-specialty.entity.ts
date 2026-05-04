import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Doctor } from "../../users/entities/doctor.entity";
import { Specialty } from "./specialty.entity";

@Entity('doctor_specialty')
export class DoctorSpecialty {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    doctorId!: number;

    //nota: essas cascates nas ainda precisa ser diligenciada de acordo com o enunciado, mas por hora, fica aí
    @ManyToOne(() => Doctor, doctor => doctor.specialties, { onDelete: 'CASCADE' })
    @JoinColumn()
    doctor!: Doctor;
    
    @Column()
    specialtyId!: number;

    @ManyToOne(() => Specialty, specialty => specialty.doctors, { onDelete: 'CASCADE' })
    @JoinColumn()
    specialty!: Specialty;
    
    @CreateDateColumn()
    assignAt!: Date;
}
