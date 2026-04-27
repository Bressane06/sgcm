import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Doctor, Patient, User } from './entities/user.entity';
import { Repository } from 'typeorm';
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
                user = this.userRepository.create(dto) as Admin;
                break;
            case UserType.DOCTOR:
                user = this.userRepository.create(dto) as Doctor;
                break;
            case UserType.PATIENT:
                user = this.userRepository.create(dto) as Patient;
                break;
            default:
                throw new BadRequestException('Tipo de usuário inválido');
        }

        try {
            return await this.userRepository.save(user);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw new ConflictException('Erro ao criar usuário: possivelmente email já cadastrado');
        }

    }

    async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<User>> {
        
        const { page, limit, sort, search } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (search) 
            queryBuilder.where('user.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` });

        if(sort){
            const [field, direction] = sort.split(':');
            queryBuilder.orderBy(`user.${field}`, direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
        }else 
            queryBuilder.orderBy('user.id', 'ASC');

        queryBuilder.skip(skip).take(limit);

        const [items, totalItems] = await queryBuilder.getManyAndCount();

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
