# SGCM — Sistema de Gerenciamento de Clínica Médica

API REST para gerenciamento de clínica médica, contemplando usuários (Admin, Doctor e Patient), especialidades, agendamentos (Schedules), atendimentos (Appointments), autenticação JWT, controle de acesso por perfil, documentação Swagger e persistência com TypeORM.

Para detalhes de implementação e decisões técnicas, consulte o [`REPORT.md`](./REPORT.md).

**Integrantes**
- [Arthur Coutinho](https://github.com/ArthurCoutinhoSI)
- [Estela Medeiros](https://github.com/estelamdrs)
- [Gabriel Bressane](https://github.com/Bressane06)

## Tecnologias

| Tecnologia | Versão               |
|------------|----------------------|
| Node.js    | `>= 18.x`            |
| NestJS     | `11.x`               |
| TypeORM    | `0.3.x`              |
| SQLite     | via `sqlite3`        |

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

| Variável        | Descrição                                | Padrão             |
|-----------------|------------------------------------------|--------------------|
| `PORT`          | Porta HTTP onde o servidor irá escutar   | `3000`             |
| `DATABASE_PATH` | Caminho para o arquivo SQLite do TypeORM | `./db/database.db` |
| `JWT_SECRET` | Segredo usado para assinar tokens JWT | obrigatório |
| `JWT_EXPIRES_IN` | Expiração do access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do refresh token | `7d` |


---

## Documentação Swagger

Após iniciar o projeto, a documentação interativa da API fica disponível em:

```
http://localhost:3000/api
```

> Se a variável `PORT` estiver configurada com outro valor, substitua `3000` pela porta escolhida.

---

## Scripts úteis

| Script               | Descrição                              |
|----------------------|----------------------------------------|
| `npm run start:dev`  | Inicia em modo desenvolvimento (watch) |
| `npm run build`      | Compila o projeto                      |

---

## Banco de dados

O projeto utiliza **SQLite**. O arquivo de banco é criado automaticamente pelo TypeORM na primeira execução, no caminho definido por `DATABASE_PATH`.

Para recriar o banco do zero, basta apagar o arquivo `.db` e reiniciar o projeto.

---

## Estrutura do projeto

```
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
│   └── modules/
│       ├── appointments/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── enum/
│       │   ├── appointments.controller.ts
│       │   ├── appointments.module.ts
│       │   └── appointments.service.ts
│       ├── auth/
│       │   ├── auth.controller.spec.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.spec.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── models/
│       │   └── strategies/
│       ├── schedules/
│       │   ├── dto/
│       │   ├── entities/
│       │   ├── enum/
│       │   ├── schedules.controller.ts
│       │   ├── schedules.module.ts
│       │   └── services/
│       ├── specialties/
│       │   ├── specialties.controller.spec.ts
│       │   ├── specialties.controller.ts
│       │   ├── specialties.module.ts
│       │   ├── specialties.service.spec.ts
│       │   ├── specialties.service.ts
│       │   ├── dto/
│       │   └── entities/
│       └── users/
│           ├── controllers/
│           ├── doctors.controller.spec.ts
│           ├── dto/
│           ├── entities/
│           ├── enum/
│           ├── services/
│           ├── users.controller.spec.ts
│           ├── users.module.ts
│           └── users.service.spec.ts
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

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | estela.admin@gmail.com | Admin@123 |
| Doctor | estela.doctor@gmail.com | Doctor@123 |
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

## Endpoints

Controle de acesso por perfil
A tabela abaixo apresenta, por endpoint, se o perfil Patient, Doctor ou Admin tem acesso (Sim) ou não (Não). Quando o acesso é permitido apenas ao próprio recurso (por exemplo, o paciente acessando apenas seus agendamentos), isso é indicado com Sim* (veja nota).
# Tabela de Endpoints – SGCM (Sistema de Gestão de Clínica Médica)

| Módulo        | Método | Endpoint                                  | Descrição                          | Autenticação |
| ------------- | ------ | ----------------------------------------- | ---------------------------------- | ------------ |
| Auth          | POST   | `/auth/login`                             | Autenticar usuário                 | Não          |
| Auth          | POST   | `/auth/refresh`                           | Renovar access token               | Não          |
| Auth          | GET    | `/auth/me`                                | Dados do usuário autenticado       | Sim          |
| Auth          | POST   | `/auth/logout`                            | Encerrar sessão                    | Sim          |
| Users         | POST   | `/users`                                  | Criar usuário                      | Sim          |
| Users         | GET    | `/users`                                  | Listar usuários                    | Sim          |
| Users         | GET    | `/users/{id}`                             | Buscar usuário por ID              | Sim          |
| Users         | PUT    | `/users/{id}`                             | Atualizar usuário                  | Sim          |
| Users         | DELETE | `/users/{id}`                             | Inativar usuário                   | Sim          |
| Doctors       | GET    | `/doctors`                                | Listar médicos                     | Sim          |
| Doctors       | GET    | `/doctors/{id}`                           | Buscar médico por ID               | Sim          |
| Doctors       | GET    | `/doctors/{id}/specialties`               | Listar especialidades do médico    | Sim          |
| Doctors       | POST   | `/doctors/{id}/specialties`               | Associar especialidade ao médico   | Sim          |
| Doctors       | DELETE | `/doctors/{id}/specialties/{specialtyId}` | Remover especialidade do médico    | Sim          |
| Doctors       | GET    | `/doctors/{id}/schedules`                 | Listar agendamentos do médico      | Sim          |
| Doctors       | GET    | `/doctors/{id}/appointments`              | Listar atendimentos do médico      | Sim          |
| Patients      | GET    | `/patients`                               | Listar pacientes                   | Sim          |
| Patients      | GET    | `/patients/{id}`                          | Buscar paciente por ID             | Sim          |
| Patients      | GET    | `/patients/{id}/schedules`                | Listar agendamentos do paciente    | Sim          |
| Patients      | GET    | `/patients/{id}/appointments`             | Listar atendimentos do paciente    | Sim          |
| Schedules     | POST   | `/schedules`                              | Criar agendamento                  | Sim          |
| Schedules     | GET    | `/schedules`                              | Listar agendamentos                | Sim          |
| Schedules     | GET    | `/schedules/{id}`                         | Buscar agendamento por ID          | Sim          |
| Schedules     | PUT    | `/schedules/{id}`                         | Atualizar agendamento              | Sim          |
| Schedules     | DELETE | `/schedules/{id}`                         | Remover agendamento                | Sim          |
| Schedules     | PATCH  | `/schedules/{id}/status`                  | Atualizar status do agendamento    | Sim          |
| Specialties   | POST   | `/specialties`                            | Criar especialidade                | Sim          |
| Specialties   | GET    | `/specialties`                            | Listar especialidades              | Sim          |
| Specialties   | GET    | `/specialties/{id}`                       | Buscar especialidade por ID        | Sim          |
| Specialties   | PUT    | `/specialties/{id}`                       | Atualizar especialidade            | Sim          |
| Specialties   | DELETE | `/specialties/{id}`                       | Remover especialidade              | Sim          |
| Specialties   | GET    | `/specialties/{id}/doctors`               | Listar médicos da especialidade    | Sim          |
| Appointments  | POST   | `/appointments`                           | Criar atendimento                  | Sim          |
| Appointments  | GET    | `/appointments`                           | Listar atendimentos                | Sim          |
| Appointments  | GET    | `/appointments/{id}`                      | Buscar atendimento por ID          | Sim          |
| Appointments  | PUT    | `/appointments/{id}`                      | Atualizar atendimento              | Sim          |
| Appointments  | PATCH  | `/appointments/{id}/finish`               | Finalizar atendimento              | Sim          |
| Reports       | POST   | `/appointments/{id}/report`               | Emitir laudo                       | Sim          |
| Reports       | GET    | `/reports/{id}/pdf`                       | Baixar PDF do laudo                | Sim          |
| Reports       | GET    | `/reports/validate/{code}`                | Validar laudo por código           | Sim          |
| Reports       | PATCH  | `/reports/{id}/revoke`                    | Revogar laudo                      | Sim          |
| Reports       | GET    | `/patients/{id}/reports`                  | Listar laudos do paciente          | Sim          |
| Reports       | GET    | `/doctors/{id}/reports`                   | Listar laudos emitidos pelo médico | Sim          |
| Admin Reports | GET    | `/admin/reports/schedules`                | Relatório de agendamentos          | Sim          |
| Admin Reports | GET    | `/admin/reports/appointments`             | Relatório de atendimentos          | Sim          |
| Admin Reports | GET    | `/admin/reports/doctors/{id}/occupation`             | Taxa de Ocupação          | Sim          |


## Total de Endpoints

* Auth: 4
* Users: 5
* Doctors: 6
* Patients: 4
* Schedules: 6
* Specialties: 6
* Appointments: 5
* Reports: 6
* Admin Reports: 3

**Total geral: 44 endpoints**

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