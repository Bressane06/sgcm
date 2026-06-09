import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';
import { ACCESS_TOKEN_BEARER_SCHEME } from './common/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter (RFC 7807 - Problem Details for HTTP APIs)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors: a ordem de registro funciona como uma pilha.
  // Registramos Transform antes para que, no pós-handler, o ClassSerializer
  // execute primeiro e remova campos marcados com @Exclude() antes de o
  // TransformInterceptor montar o envelope { data, meta }.
  app.useGlobalInterceptors(
    new TransformInterceptor(app.get(Reflector)),
    new ClassSerializerInterceptor(app.get(Reflector)),
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
    .setDescription(
      `API para gerenciamento de usuários, especialidades e agendamentos.

Como testar a API no Swagger:

1. Faça login em POST /auth/login.
2. Copie o accessToken retornado.
3. Clique em Authorize no topo da página.
4. Cole o token no esquema access-token.
5. Use os endpoints protegidos normalmente; o Swagger enviará o cabeçalho Authorization: Bearer {token} automaticamente nas rotas marcadas com @ApiBearerAuth('access-token').

Rotas públicas de autenticação:

- POST /auth/login
- POST /auth/refresh

As respostas de sucesso seguem o envelope { data, meta } produzido pelo TransformInterceptor.
`,
    )
    .setVersion('2.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido em POST /auth/login',
      },
      ACCESS_TOKEN_BEARER_SCHEME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ordenando as tags para melhor organização na interface do Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: (a, b) => {
        const order = [
          'Auth',
          'Users',
          'Doctors',
          'Patients',
          'Schedules',
          'Specialties',
          'Appointments',
          'Reports',
          'Admin Reports',
        ];
        return order.indexOf(a) - order.indexOf(b);
      },
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
