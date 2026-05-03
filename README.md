# SGCM — Sistema de Gerenciamento de Clínica Médica

API REST para gerenciamento de usuários com perfis diferenciados (Admin, Doctor e Patient), validações, documentação Swagger e herança de tabelas no banco de dados.

**Integrantes**
- Arthur Coutinho
- Estela Medeiros
- Gabriel Bressane

## Tecnologias

| Tecnologia | Versão               |
|------------|----------------------|
| Node.js    | `>= 18.x`            |
| NestJS     | `11.x`               |
| TypeORM    | `0.3.x`              |
| SQLite     | via `better-sqlite3` |

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
```

| Variável        | Descrição                                | Padrão             |
|-----------------|------------------------------------------|--------------------|
| `PORT`          | Porta HTTP onde o servidor irá escutar   | `3000`             |
| `DATABASE_PATH` | Caminho para o arquivo SQLite do TypeORM | `./db/database.db` |


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
├── .env
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
├── REPORT.md
├── tsconfig.build.json
├── tsconfig.json
├── db/
│   └── database.db
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── common/
│   │   ├── index.ts
│   │   ├── dto/
│   │   │   ├── paginated-response.dto.ts
│   │   │   ├── pagination-query.dto.ts
│   │   │   └── problem-details.dto.ts
│   │   ├── exceptions/
│   │   │   ├── app.exception.ts
│   │   │   ├── conflict.exception.ts
│   │   │   ├── forbidden.exception.ts
│   │   │   ├── index.ts
│   │   │   ├── not-found.exception.ts
│   │   │   ├── unauthorized.exception.ts
│   │   │   └── validation.exception.ts
│   │   └── filters/
│   │       ├── http-exception.filter.ts
│   │       ├── http-exception.types.ts
│   │       └── index.ts
│   └── modules/
│       └── users/
│           ├── users.controller.spec.ts
│           ├── users.controller.ts
│           ├── users.module.ts
│           ├── users.service.spec.ts
│           ├── dto/
│           │   ├── create-doctor.dto.ts
│           │   ├── create-patient.dto.ts
│           │   ├── create-user.dto.ts
│           │   ├── update-doctor.dto.ts
│           │   ├── update-patient.dto.ts
│           │   └── update-user.dto.ts
│           ├── entities/
│           │   ├── admin.entity.ts
│           │   ├── doctor.entity.ts
│           │   ├── patient.entity.ts
│           │   └── user.entity.ts
│           ├── enum/
│           │   └── user-type.enum.ts
│           └── services/
│               ├── users-factory.service.ts
│               ├── users-uniqueness.service.ts
│               └── users.service.ts
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```


Para detalhes de implementação e decisões técnicas, consulte o [`REPORT.md`](./REPORT.md).