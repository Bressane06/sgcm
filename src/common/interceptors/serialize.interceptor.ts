import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { Admin } from 'src/modules/users/entities/admin.entity';
import { Doctor } from 'src/modules/users/entities/doctor.entity';
import { Patient } from 'src/modules/users/entities/patient.entity';
import { AdminResponseDto } from 'src/modules/users/dto/admin-response.dto';
import { DoctorResponseDto } from 'src/modules/users/dto/doctor-response.dto';
import { PatientResponseDto } from 'src/modules/users/dto/patiente-response.dto';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        if (data && data.items && Array.isArray(data.items)) {
          return {
            ...data,
            items: data.items.map((item) => this.transform(item)),
          };
        }
        
        return this.transform(data);
      }),
    );
  }

  private transform(entity: any) {
    if(!entity) 
        return entity;

    const opts = { excludeExtraneousValues: true };

    if(entity instanceof Doctor)
        return plainToInstance(DoctorResponseDto, entity, opts);
    if(entity instanceof Patient) 
        return plainToInstance(PatientResponseDto, entity, opts);
    if(entity instanceof Admin)
        return plainToInstance(AdminResponseDto, entity, opts);

    return plainToInstance(UserResponseDto, entity, opts);
  }
}