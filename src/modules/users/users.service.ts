import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Doctor, Patient, User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserType } from './enum/user-type.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async create(dto: CreateUserDto): Promise<User> {
        
        let user: User;

        switch (dto.type) {
            case UserType.ADMIN:
                const admin = new Admin();
                Object.assign(admin, dto);
                user = admin;
            break;

            case UserType.DOCTOR:
                const doctor = new Doctor();
                Object.assign(doctor, dto);
                user = doctor;
            break;

            case UserType.PATIENT:
                const patient = new Patient();
                Object.assign(patient, dto);
                user = patient;
            break;

            default:
            throw new BadRequestException('Tipo inválido');
        }

        return await this.userRepository.save(user);
    }
    async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<User>> {
        const { page, limit, sort, search } = query;
        const skip = (page - 1) * limit;

        const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

        const [items, totalItems] = await this.userRepository.findAndCount({
            where: search
                ? [
                    { name: Like(`%${search}%`) },
                    { email: Like(`%${search}%`) },
                ]
                : undefined,
            order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
            skip,
            take: limit,
        });

        return {
            items,
            meta: {
                itemCount: items.length,
                totalItems,
                itemsPerPage: limit,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
            },
        };
    }
    async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
        throw new NotFoundException('Usuário não encontrado');
    }

    return user;
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, dto);
        return this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
}
