import { Entity, PrimaryGeneratedColumn, Column, TableInheritance,
  CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserType } from '../enum/user-type.enum';

@Entity('user')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column({ select: false })
  password!: string;

  @Column({ type: 'varchar' })
  type!: UserType;

  @Column({ default: true })
  isActive!: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  activate() { this.isActive = true; }
  deactivate() { this.isActive = false; }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}