import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  CreateDateColumn,
  UpdateDateColumn,
  ChildEntity,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from "class-transformer";
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

    // Hash de senha, para garantir segurança dos dados do usuário
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {

        // $2b$ é o prefixo padrão para senhas hashadas com bcrypt
        if(this.password && !this.password.startsWith('$2b$')){
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    // Uso da lib bcrypt para hash de senha
    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}

@ChildEntity('ADMIN')
export class Admin extends User {
    
    @Column({ nullable: true })
    accessLevel: string;
}

@ChildEntity('DOCTOR')
export class Doctor extends User {

    @Column({ nullable: true })
    crm: string;

}

@ChildEntity('PATIENT')
export class Patient extends User {
    
    @Column({ unique: true, nullable: true })
    cpf: string;

    @Column({ nullable: true })
    birthDate: Date;

    getAge(): number {

        if (!this.birthDate) {
            return 0; 
        }
        const today = new Date();
        const birthDate = new Date(this.birthDate);
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }
        
}