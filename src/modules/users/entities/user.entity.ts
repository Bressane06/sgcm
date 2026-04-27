import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	TableInheritance,
	CreateDateColumn,
	UpdateDateColumn,
	BeforeInsert,
	BeforeUpdate,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { UserType } from '../enum/user-type.enum';

@Entity()
@TableInheritance({ column: { name: 'type', type: 'varchar' } })
export abstract class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@Exclude()
	@Column()
	password: string;

	@Column({ nullable: true })
	type: UserType;

	@Column({ default: true })
	isActive: boolean;

	@Column({ nullable: true, select: false })
	refreshToken?: string;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	activate() {
		this.isActive = true;
	}

	deactivate() {
		this.isActive = false;
	}

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