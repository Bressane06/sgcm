# SGCM — Sistema de Gerenciamento de Clínica Médica

API REST para gerenciamento de usuários com perfis diferenciados (Admin, Doctor e Patient), validações, documentação Swagger e herança de tabelas no banco de dados.

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

## Credenciais de Teste

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | estela.admin@gmail.com | Admin@123 |
| Doctor | estela.doctor@gmail.com | Doctor@123 |
| Patient | estela.patient@gmail.com | Patient@123 |

Para autenticar, use `POST /auth/login`. Copie o `accessToken` retornado e clique em **Authorize** no Swagger.
