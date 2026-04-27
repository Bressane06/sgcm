import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { Admin, Doctor, Patient } from './entities/user.entity';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { PatientResponseDto } from './dto/patiente-response.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService){}

    @Post()
    async create(@Body() dto: CreateUserDto) {
        const user = await this.usersService.create(dto);
        return plainToInstance(UserResponseDto, user);
    }

    @Get()
    async findAll(@Query() query: PaginationQueryDto) {
        const result = await this.usersService.findAll(query);

        return {
            items: plainToInstance(UserResponseDto, result.items),
            meta: result.meta,
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
    const user = await this.usersService.findOne(Number(id));

    if (user instanceof Doctor) {
        return plainToInstance(DoctorResponseDto, user);
    }

    if (user instanceof Patient) {
        return plainToInstance(PatientResponseDto, user);
    }

    if (user instanceof Admin) {
        return plainToInstance(AdminResponseDto, user);
    }

    return plainToInstance(UserResponseDto, user);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        const user = await this.usersService.update(Number(id), dto);
        return plainToInstance(UserResponseDto, user);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        const user = await this.usersService.remove(Number(id));
        return plainToInstance(UserResponseDto, user);
    }


}
