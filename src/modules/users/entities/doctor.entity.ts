import { ChildEntity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';
import { UserType } from '../enum/user-type.enum';

@ChildEntity(UserType.DOCTOR)
export class Doctor extends User {
  @Column({ unique: true, nullable: true })
  crm!: string;

  @OneToMany(() => DoctorSpecialty, (ds) => ds.doctor, { cascade: true })
  specialties!: DoctorSpecialty[];
}
