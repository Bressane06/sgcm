import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DoctorSpecialty } from "./doctor-specialty.entity";

@Entity('specialty')
export class Specialty {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column()
    description!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => DoctorSpecialty, doctorSpecialty => doctorSpecialty.specialtyId)
    doctors?: DoctorSpecialty[];
}
