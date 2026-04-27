import { ChildEntity, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@ChildEntity()
export class Patient extends User {
  @Column({ unique: true, nullable: true })
  cpf: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;
}