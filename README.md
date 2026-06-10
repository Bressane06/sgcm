# SGCM — Sistema de Gerenciamento de Clínica Médica

API REST para gerenciamento de clínica médica, contemplando usuários (Admin, Doctor e Patient), especialidades, agendamentos (Schedules), atendimentos (Appointments), autenticação JWT, controle de acesso por perfil, documentação Swagger e persistência com TypeORM.

Para detalhes de implementação e decisões técnicas, consulte o [`REPORT.md`](./REPORT.md).

**Integrantes**

- [Arthur Coutinho](https://github.com/ArthurCoutinhoSI)
- [Estela Medeiros](https://github.com/estelamdrs)
- [Gabriel Bressane](https://github.com/Bressane06)

## Tecnologias

| Tecnologia | Versão        |
| ---------- | ------------- |
| Node.js    | `>= 18.x`     |
| NestJS     | `11.x`        |
| TypeORM    | `0.3.x`       |
| SQLite     | via `sqlite3` |

---

## Pré-requisitos

- Node.js `>= 18.x` e npm instalados
- Git instalado

---

## Instalação e execução

1. Clone o repositório e entre na pasta:

```bash
git clone <repo-url>
cd sgcm
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto (veja seção abaixo)

4. Inicie em modo desenvolvimento:

```bash
npm run start:dev
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
# Porta onde a API vai escutar (padrão: 3000)
PORT=3000

# Caminho para o arquivo SQLite usado pelo TypeORM
DATABASE_PATH=./db/database.db

# JWT Token
JWT_SECRET=cole_aqui_um_segredo_com_32_ou_mais_caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

```

| Variável                 | Descrição                                | Padrão             |
| ------------------------ | ---------------------------------------- | ------------------ |
| `PORT`                   | Porta HTTP onde o servidor irá escutar   | `3000`             |
| `DATABASE_PATH`          | Caminho para o arquivo SQLite do TypeORM | `./db/database.db` |
| `JWT_SECRET`             | Segredo usado para assinar tokens JWT    | obrigatório        |
| `JWT_EXPIRES_IN`         | Expiração do access token                | `15m`              |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do refresh token               | `7d`               |

---

## Documentação Swagger

Após iniciar o projeto, a documentação interativa da API fica disponível em:

```
http://localhost:3000/api
```

> Se a variável `PORT` estiver configurada com outro valor, substitua `3000` pela porta escolhida.

---

## Scripts úteis

| Script              | Descrição                              |
| ------------------- | -------------------------------------- |
| `npm run start:dev` | Inicia em modo desenvolvimento (watch) |
| `npm run build`     | Compila o projeto                      |

---

## Banco de dados

O projeto utiliza **SQLite**. O arquivo de banco é criado automaticamente pelo TypeORM na primeira execução, no caminho definido por `DATABASE_PATH`.

Para recriar o banco do zero, basta apagar o arquivo `.db` e reiniciar o projeto.

---

## Estrutura do projeto

```text
sgcm/
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── README.md
├── REPORT.md
├── UML/
│   └── diagrama.puml
├── db/
│   └── ...
├── dist/
│   └── ...
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── exceptions/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── swagger/
│   │   └── utils/
│   │
│   └── modules/
│       ├── admin/
│       │   ├── controllers/
│       │   ├── dto/
│       │   ├── interfaces/
│       │   ├── services/
│       │   └── admin.module.ts
│       │
│       ├── appointments/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── enum/
│       │   ├── appointments.controller.ts
│       │   ├── appointments.module.ts
│       │   └── appointments.service.ts
│       │
│       ├── auth/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── models/
│       │   ├── strategies/
│       │   ├── auth.controller.spec.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.spec.ts
│       │   └── auth.service.ts
│       │
│       ├── medical-records/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── medical-records.controller.ts
│       │   ├── medical-records.module.ts
│       │   └── medical-records.service.ts
│       │
│       ├── procedures/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── enum/
│       │   ├── procedures.controller.ts
│       │   ├── procedures.module.ts
│       │   └── procedures.service.ts
│       │
│       ├── reports/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── enum/
│       │   ├── reports.controller.ts
│       │   ├── reports.module.ts
│       │   └── reports.service.ts
│       │
│       ├── schedules/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── enum/
│       │   ├── services/
│       │   ├── schedules.controller.ts
│       │   └── schedules.module.ts
│       │
│       ├── specialties/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── specialties.controller.spec.ts
│       │   ├── specialties.controller.ts
│       │   ├── specialties.module.ts
│       │   ├── specialties.service.spec.ts
│       │   └── specialties.service.ts
│       │
│       └── users/
│           ├── controllers/
│           ├── dto/
│           ├── entities/
│           ├── enum/
│           ├── services/
│           ├── doctors.controller.spec.ts
│           ├── users.controller.spec.ts
│           ├── users.module.ts
│           └── users.service.spec.ts
│
├── tsconfig.build.json
├── tsconfig.json
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

## Funcionalidades

- Autenticação JWT
- Controle de acesso por perfis (Admin, Doctor e Patient)
- Gerenciamento de usuários
- Gerenciamento de especialidades
- Gerenciamento de agendamentos
- Gerenciamento de atendimentos
- Documentação Swagger
- Tratamento padronizado de erros (RFC 7807)

## Credenciais de Teste

| Perfil  | E-mail                   | Senha       |
| ------- | ------------------------ | ----------- |
| Admin   | estela.admin@gmail.com   | Admin@123   |
| Doctor  | estela.doctor@gmail.com  | Doctor@123  |
| Patient | estela.patient@gmail.com | Patient@123 |

Para autenticar, use `POST /auth/login`. Copie o `accessToken` retornado e clique em **Authorize** no Swagger.

## ValidationCode

Exemplo do `ValidationCode` = 9f0f68f5-e7cd-445e-8cbf-286d2fd91adf;

**Implementação:**

Arquivo: [src/modules/reports/reports.service.ts](src/modules/reports/reports.service.ts)

```ts
import { randomUUID } from 'crypto';

const report = this.reportRepository.create({
  appointmentId,
  patientId: appointment.schedule.patientId,
  doctorId: appointment.schedule.doctorId,
  examType: dto.examType,
  result: dto.result,
  status: ReportStatus.ACTIVE,
  validationCode: randomUUID(), // Gera UUID único
  issuedByUserId: currentUser.sub,
  issuedByDoctorId: issuedByDoctorId: doctor.id,

});

```

### Para testes

| Validation Code                        | Status   |
| -------------------------------------- | -------- |
| `d19e0b12-4e9b-4138-8ac7-b4a3ded5b34b` | Ativo    |
| `02a5bc59-4cf2-4dfc-98f4-1e390da337c3` | Revogado |

## Tabela de Endpoints – SGCM (Sistema de Gestão de Clínica Médica)

### Controle de Acesso por Endpoint

| Método | Endpoint                                  | Admin   | Doctor              | Patient  | Controle por Recurso                        |
| ------ | ----------------------------------------- | ------- | ------------------- | -------- | ------------------------------------------- |
| POST   | `/auth/login`                             | Público | Público             | Público  | —                                           |
| POST   | `/auth/refresh`                           | Público | Público             | Público  | —                                           |
| GET    | `/auth/me`                                | Próprio | Próprio             | Próprio  | Usuário autenticado                         |
| POST   | `/auth/logout`                            | Próprio | Próprio             | Próprio  | Usuário autenticado                         |
| POST   | `/users`                                  | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/users`                                  | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/users/{id}`                             | ✅      | Próprio             | Próprio  | Próprio usuário                             |
| PATCH  | `/users/{id}`                             | ✅      | Próprio             | Próprio  | Próprio usuário                             |
| DELETE | `/users/{id}`                             | ✅      | ❌                  | ❌       | Admin não pode excluir a si mesmo           |
| GET    | `/doctors`                                | ✅      | ✅                  | ✅       | —                                           |
| GET    | `/doctors/{id}`                           | ✅      | ✅                  | ✅       | —                                           |
| GET    | `/doctors/{id}/specialties`               | ✅      | ✅                  | ✅       | —                                           |
| POST   | `/doctors/{id}/specialties`               | ✅      | ❌                  | ❌       | —                                           |
| DELETE | `/doctors/{id}/specialties/{specialtyId}` | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/doctors/{id}/schedules`                 | ✅      | Própria agenda      | ❌       | Doctor apenas seus agendamentos             |
| GET    | `/doctors/{id}/appointments`              | ✅      | Própria agenda      | ❌       | Doctor apenas seus atendimentos             |
| GET    | `/doctors/{id}/records`                   | ✅      | Própria lista       | ❌       | Doctor apenas seus prontuários              |
| GET    | `/doctors/{id}/reports`                   | ✅      | Própria lista       | ❌       | Doctor apenas seus laudos                   |
| GET    | `/patients`                               | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/patients/{id}`                          | ✅      | ❌                  | Próprio  | Patient apenas seus dados                   |
| GET    | `/patients/{id}/schedules`                | ✅      | ❌                  | Próprios | Patient apenas seus agendamentos            |
| GET    | `/patients/{id}/appointments`             | ✅      | ❌                  | Próprios | Patient apenas seus atendimentos            |
| GET    | `/patients/{id}/records`                  | ✅      | Pacientes atendidos | Próprios | Controle por vínculo clínico                |
| GET    | `/patients/{id}/reports`                  | ✅      | Pacientes atendidos | Próprios | Controle por vínculo clínico                |
| POST   | `/schedules`                              | ✅      | ❌                  | Próprio  | Patient agenda apenas para si               |
| GET    | `/schedules`                              | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/schedules/{id}`                         | ✅      | Próprios            | Próprios | Doctor/Patient apenas recursos relacionados |
| PUT    | `/schedules/{id}`                         | ✅      | ❌                  | ❌       | —                                           |
| DELETE | `/schedules/{id}`                         | ✅      | ❌                  | ❌       | —                                           |
| PATCH  | `/schedules/{id}/status`                  | ✅      | ❌                  | Próprios | Patient apenas cancelamento próprio         |
| POST   | `/specialties`                            | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/specialties`                            | ✅      | ✅                  | ✅       | —                                           |
| GET    | `/specialties/{id}`                       | ✅      | ✅                  | ✅       | —                                           |
| PUT    | `/specialties/{id}`                       | ✅      | ❌                  | ❌       | —                                           |
| DELETE | `/specialties/{id}`                       | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/specialties/{id}/doctors`               | ✅      | ✅                  | ✅       | —                                           |
| POST   | `/appointments`                           | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/appointments`                           | ✅      | ❌                  | ❌       | —                                           |
| GET    | `/appointments/{id}`                      | ✅      | Próprios            | Próprios | Controle por recurso                        |
| PUT    | `/appointments/{id}`                      | ✅      | Próprios            | ❌       | Controle por recurso                        |
| PATCH  | `/appointments/{id}/finish`               | ✅      | Próprios            | ❌       | Controle por recurso                        |
| POST   | `/appointments/{id}/procedures`           | ✅      | Próprios            | ❌       | Controle por recurso                        |
| GET    | `/appointments/{id}/procedures`           | ✅      | Próprios            | Próprios | Controle por recurso                        |
| POST   | `/appointments/{id}/records`              | ✅      | Próprios            | ❌       | Controle por recurso                        |
| GET    | `/appointments/{id}/records`              | ✅      | Próprios            | Próprios | Controle por recurso                        |
| POST   | `/appointments/{id}/report`               | ✅      | Próprios            | ❌       | Controle por recurso                        |
| GET    | `/procedures/{id}`                        | ✅      | Próprios            | Próprios | Controle por recurso                        |
| PUT    | `/procedures/{id}`                        | ✅      | Próprios            | ❌       | Controle por recurso                        |
| DELETE | `/procedures/{id}`                        | ✅      | Próprios            | ❌       | Controle por recurso                        |
| PATCH  | `/procedures/{id}/authorize`              | ✅      | ❌                  | ❌       | Apenas Admin                                |
| PATCH  | `/procedures/{id}/deny`                   | ✅      | ❌                  | ❌       | Apenas Admin                                |
| PUT    | `/records/{id}`                           | ✅      | Próprios            | ❌       | Controle por recurso                        |
| GET    | `/reports/{id}/pdf`                       | ✅      | Próprios            | Próprios | Controle por recurso                        |
| PATCH  | `/reports/{id}/revoke`                    | ✅      | Próprios            | ❌       | Controle por recurso                        |
| GET    | `/reports/validate/{code}`                | Público | Público             | Público  | Não requer autenticação                     |
| GET    | `/admin/reports/schedules`                | ✅      | ❌                  | ❌       | Apenas Admin                                |
| GET    | `/admin/reports/appointments`             | ✅      | ❌                  | ❌       | Apenas Admin                                |
| GET    | `/admin/reports/procedures`               | ✅      | ❌                  | ❌       | Apenas Admin                                |
| GET    | `/admin/reports/doctors/{id}/occupation`  | ✅      | ❌                  | ❌       | Apenas Admin                                |

## Total de Endpoints

| Módulo          |   Qtde |
| --------------- | -----: |
| Auth            |      4 |
| Users           |      5 |
| Doctors         |      8 |
| Patients        |      6 |
| Schedules       |      6 |
| Specialties     |      6 |
| Appointments    |      8 |
| Procedures      |      5 |
| Medical Records |      5 |
| Reports         |      6 |
| Admin Reports   |      4 |
| **Total**       | **63** |

## Taxa de Ocupação

A taxa de ocupação mede a proporção de agendamentos que resultaram efetivamente em atendimento dentro do período analisado.

### Fórmula

```text
Taxa de Ocupação (%) =
(COMPLETED / (PENDING + CONFIRMED + COMPLETED + CANCELLED)) × 100
```

### Justificativa

O denominador considera todos os agendamentos criados no período, independentemente de seu status final, representando a demanda total atendida pela clínica.

O numerador considera apenas os agendamentos com status `COMPLETED`, pois são aqueles que efetivamente resultaram em atendimento realizado.

Os agendamentos com status `CANCELLED` permanecem no denominador porque representam horários que chegaram a ser reservados, mas não geraram atendimento. Sua inclusão permite que a métrica reflita perdas de ocupação decorrentes de cancelamentos, fornecendo uma visão mais fiel da utilização da agenda.

### Interpretação

- **100%**: todos os agendamentos resultaram em atendimento.
- **Taxas menores**: indicam perdas de ocupação causadas por cancelamentos ou agendamentos que permaneceram pendentes ou apenas confirmados durante o período analisado.
- **Quanto maior a taxa**, maior a eficiência no aproveitamento da agenda médica.

## Exemplos Endpoints

Observação: Os exemplos de requisição e resposta de cada endpoint não foram replicados nesta documentação, pois já estão disponíveis diretamente no Swagger da API. Para cada operação, o Swagger apresenta os DTOs utilizados, parâmetros aceitos, exemplos de payloads, códigos de resposta HTTP e descrições detalhadas, servindo como a principal referência para consumo e testes dos endpoints.