import { Injectable } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord } from './entities/medical-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '../../common';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  create(createMedicalRecordDto: CreateMedicalRecordDto) {
    return 'This action adds a new medicalRecord';
  }

  findAppointmentRecords() {
    return `This action returns all medicalRecords`;
  }

  async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord>{
    const record = await this.medicalRecordRepository.findOneBy({ id });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    Object.assign(record, updateMedicalRecordDto);

    await this.medicalRecordRepository.save(record);

    return record;
  }

  findPatientRecords(id: number) {
    const records = this.medicalRecordRepository.find({
      where: {
        updatedBy: {
          patients: {
            id,
          },
        },
      },
    });
    return records; 
  }

  findDoctorRecords(id: number) {
    const records = this.medicalRecordRepository.find({
      where: {
        updatedBy: {
          id,
        },
      },
    });
    return records;
  }
}
