import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter (RFC 7807 - Problem Details for HTTP APIs)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors: Transform deve ser registrado após ClassSerializer
  // para que no pós-handler, ClassSerializer execute primeiro (removendo @Exclude())
  // e depois Transform envolve os dados serializados no envelope padrão.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SGCM — Sistema de Gestão de Clínica Médica')
    .setDescription('API para gerenciamento de usuários, especialidades e agendamentos.')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ordenando as tags para melhor organização na interface do Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: (a, b) => {
        const order = ['Auth', 'Users', 'Doctors', 'Patients', 'Schedules', 'Specialties'];
        return order.indexOf(a) - order.indexOf(b);
      },
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
