import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { NotFoundException } from '../../../common/exceptions';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { UsersFactoryService } from './users-factory.service';
import { UsersUniquenessService } from './users-uniqueness.service';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';

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

  async findAll(query: FindUsersQueryDto): Promise<PaginatedResponseDto<User>> {
    const { page, limit, sort, search } = query;
    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];
    const where: FindOptionsWhere<User>[] = [];

    if (search) {
      where.push(
        {
          name: Like(`%${search}%`),
          isActive: true,
          ...(query.type && { type: query.type }),
        },
        {
          email: Like(`%${search}%`),
          isActive: true,
          ...(query.type && { type: query.type }),
        },
      );
    }

    const defaultWhere: FindOptionsWhere<User> | undefined = query.type
      ? { type: query.type, isActive: true }
      : { isActive: true };

    const [items, totalItems] = await this.userRepository.findAndCount({
      where: search ? where : defaultWhere,
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: items,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) throw new NotFoundException('Usuário', id);
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    await this.usersUniquenessService.validateUniqueFields(
      { type: user.type, email: dto.email, crm: dto.crm },
      id,
    );

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.deactivate();
    await this.userRepository.save(user);
  }
}
