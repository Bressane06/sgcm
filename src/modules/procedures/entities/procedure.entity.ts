import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { ProcedureType } from '../enum/procedure-type.enum';

@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Procedure {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  type!: ProcedureType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
