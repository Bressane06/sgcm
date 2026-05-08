# Relatório Técnico — SGCM API


## 1. Estratégia de Herança: Por que escolhemos JTI

O modelo de usuários possui três subtipos — `Admin`, `Doctor` e `Patient` — cada um com atributos comuns (nome, e-mail, senha, tipo) e atributos específicos (`accessLevel`, `crm`, `cpf`/`birthDate`). Era necessário escolher uma estratégia de herança que equilibrasse normalização do schema e performance.

O JTI foi escolhido por oferecer o melhor equilíbrio para o contexto do SGCM:

- A tabela `user` responde consultas gerais (listagem, busca) sem nenhum JOIN
- JOINs com `doctor`, `patient` ou `admin` acontecem apenas quando os campos específicos são necessários
- Nenhuma coluna nula — cada tabela armazena exatamente o que lhe pertence
- Constraints `NOT NULL` e `UNIQUE` aplicáveis corretamente em cada tabela
- Alterações em campos comuns afetam apenas a tabela `user`

---

### 1.1. Por que a implementação foi manual

O **TypeORM**, ORM utilizado no projeto com NestJS, **não oferece suporte nativo ao JTI**. As únicas estratégias suportadas nativamente são:

| Estratégia | Suporte no TypeORM |
|---|---|
| Single Table Inheritance | ✅ via `@TableInheritance` + `@ChildEntity` |
| Concrete Table Inheritance | ✅ via `@Entity` independente em cada classe |
| **Joined Table Inheritance** | ❌ não suportado |

O mecanismo `@TableInheritance` + `@ChildEntity` do TypeORM, apesar de nominalmente chamado de suporte a herança, implementa **exclusivamente STI** — todas as colunas de todas as subclasses vão para a mesma tabela.

Diante dessa limitação, a solução adotada foi **simular o JTI manualmente**, utilizando os recursos que o TypeORM oferece:

- A entidade `User` foi mantida com `@Entity('user')` como tabela base
- As entidades `Admin`, `Doctor` e `Patient` foram criadas como entidades **independentes** (sem `extends User`), cada uma com sua própria tabela contendo apenas seus atributos específicos
- O relacionamento entre as tabelas é feito via `@OneToOne` com `@JoinColumn`, estabelecendo a chave estrangeira (`userId`) que liga cada subtipo à tabela base
- A opção `cascade: true` garante que ao salvar um `Doctor`, por exemplo, o registro correspondente em `user` também é criado automaticamente
- A opção `eager: true` garante que os dados do `user` base são carregados automaticamente junto com os dados do subtipo

**Schema resultante:**

tabela user                          
| id | name  | email | type    | ... |
|----|-------|-------|---------|-----|
| 1  | João  | ...   | DOCTOR  |     |
| 2  | Maria | ...   | PATIENT |     |

tabela doctor             
| id | userId | crm        |
|----|--------|------------|
| 1  | 1      | CRM/SP-123 |

tabela patient
| id | userId | cpf      | birthDate  |
|----|--------|----------|------------|
| 1  | 2      | 123.456  | 1990-01-01 |

O processo de criação ficou centralizado no `UsersFactoryService`, que monta a entidade `User` base, aninha dentro do subtipo correto e persiste via repositório da subclasse — aproveitando o `cascade` para salvar as duas tabelas em uma única operação.

---

### 2. Separação de responsabilidades nos serviços

O módulo de usuários foi dividido em três serviços com responsabilidades distintas, evitando que um único serviço acumulasse lógica demais:

**`UsersService`** — orquestra as operações CRUD. Delega a criação de entidades para a factory e a verificação de unicidade para o serviço específico. É o único serviço exposto para outros módulos via `exports`.

**`UsersFactoryService`** — responsável exclusivamente por instanciar e persistir a entidade correta de acordo com o tipo do usuário. Encapsula a lógica de qual repositório usar e como montar o objeto antes de salvar. Essa separação evita um `switch` gigante espalhado pelo `UsersService`.

**`UsersUniquenessService`** — centraliza a verificação de unicidade de campos como `email`, `crm` e `cpf`. Sem esse serviço, essa lógica seria duplicada tanto no `create` quanto no `update`. Ele recebe um `currentUserId` opcional para ignorar o próprio registro ao validar atualizações, evitando falsos positivos de conflito.

---

### 3. Tratamento de erros com RFC 7807

As exceções seguem o padrão **RFC 7807 (Problem Details for HTTP APIs)**, implementado via `HttpExceptionFilter` global. Todas as respostas de erro retornam um objeto estruturado:

```json
{
  "type": "https://sgcm.example.com/problems/conflict",
  "title": "Conflito",
  "status": 409,
  "detail": "E-mail já existe",
  "instance": "/users",
  "method": "POST",
  "timestamp": "2026-05-02T20:42:15.312Z",
  "traceId": "2c75672e-2bf2-418b-921a-63016352a9c3"
}
```

O `traceId` gerado por UUID em cada requisição facilita o rastreamento de erros em logs. Exceções customizadas (`NotFoundException`, `ConflictException`, `ValidationException`) são lançadas nos serviços e capturadas centralmente pelo filtro, evitando tratamento de erro espalhado pelo código.

### 4. Feature Doctors
A feature **Doctors** tem relação íntima com **Users**: um doctor é, na prática, um user. Por isso, seus arquivos relacionados ficam dentro de `users`.

Outra relação importante de Doctors é com **Specialties**. Como specialties existem separadamente e não representam um user, elas ficam em outra pasta. Essa feature foi implementada um pouco depois, mas ainda em paralelo com Doctors, devido à relação de muitos-para-muitos entre doctors e specialties.

Durante o desenvolvimento dessa feature, decidiu-se criar uma pasta de controllers para melhor organização dos arquivos.

### 5. Feature Specialties
A feature **Specialties** foi desenvolvida depois que a estrutura de **Doctors** já estava pronta, já que não faz sentido existir uma especialidade sem um doctor associado.

Um ponto crítico que exigiu uma decisão não especificada no enunciado foi o endpoint `/doctors/{id}/specialties`, que não informa o identificador da especialidade. Para resolver isso, considerando que o nome da especialidade é único, a requisição HTTP passou a exigir no body um JSON com o campo `name`.

---

## Conclusão

A escolha pelo JTI foi técnica e consciente: o schema resultante é mais limpo, normalizado e preparado para crescimento. O custo foi a necessidade de uma implementação manual, já que o TypeORM não oferece suporte nativo a essa estratégia. Essa abordagem exigiu um entendimento mais profundo tanto do ORM quanto do modelo relacional, mas resultou em uma arquitetura mais robusta e alinhada com as boas práticas de modelagem de banco de dados.

As demais decisões — separação de serviços, validação condicional por tipo, hash na entidade, paginação padronizada e tratamento de erros RFC 7807 — refletem o mesmo princípio: soluções que isolam responsabilidades, reduzem duplicação e tornam o sistema mais fácil de evoluir e manter.