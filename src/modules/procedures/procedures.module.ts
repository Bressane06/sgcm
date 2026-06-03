import { Module } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { ProceduresController } from './procedures.controller';
import { Procedure } from './entities/procedure.entity';
import { SimpleProcedure } from './entities/simple-procedure.entity';
import { SpecializedProcedure } from './entities/specialized-procedure.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Procedure,
      SimpleProcedure,
      SpecializedProcedure,
    ]),
  ],
  controllers: [ProceduresController],
  providers: [ProceduresService],
})
export class ProceduresModule {}
