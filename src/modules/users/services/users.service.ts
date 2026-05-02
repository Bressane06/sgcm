import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException } from '../../../common/exceptions';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { UsersFactoryService } from './users-factory.service';
import { UsersUniquenessService } from './users-uniqueness.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersFactoryService: UsersFactoryService,
    private readonly usersUniquenessService: UsersUniquenessService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.usersUniquenessService.validateUniqueFields(dto);
    return await this.usersFactoryService.create(dto);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<User>> {
    const { page, limit, sort, search } = query;
    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const [items, totalItems] = await this.userRepository.findAndCount({
      where: search
        ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
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
    if (!user) throw new NotFoundException('Usuário', id);
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const targetType = dto.type ?? user.type;

    await this.usersUniquenessService.validateUniqueFields(
      { type: targetType, email: dto.email, crm: dto.crm, cpf: dto.cpf },
      id,
    );

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}