import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { ProcedureType } from '../enum/procedure-type.enum';

@Entity('procedure')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Procedure {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({ type: 'varchar', name: 'type', insert: false, update: false })
  type!: ProcedureType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
