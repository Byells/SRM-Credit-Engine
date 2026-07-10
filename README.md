# SRM Credit Engine

Plataforma de cessão de crédito multimoedas (FIDC) — motor de precificação, conversão cambial e liquidação de recebíveis com persistência ACID.

Este projeto é a entrega do desafio técnico SRM Asset. Nível-alvo desta entrega: **Pleno** (cumulativo com os requisitos de nível Júnior).

## Stack

**Backend:** Node.js + TypeScript + Express, TypeORM (persistência transacional/ACID) + Knex (SQL query builder para relatórios), Zod (validação), MySQL 8.
**Frontend:** React + TypeScript + Vite, React Router, Axios.
**Infra:** Docker + Docker Compose.

Justificativa: TypeScript foi escolhido pela tipagem forte, essencial em ambiente financeiro (evita classes inteiras de bugs de tipo em cálculos monetários). `decimal.js` é usado em todo o motor de precificação para evitar erros de ponto flutuante em operações com dinheiro. TypeORM cuida da escrita transacional (via `QueryRunner`, com commit/rollback explícitos) enquanto o Knex é usado exclusivamente na camada de relatórios (`/extrato`), que só precisa de 2 camadas (controller → repository) conforme pedido no case, sem a sobrecarga de um ORM para consultas analíticas.

## Como rodar

### Opção 1 — Docker Compose (recomendado, sobe banco + backend + frontend)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Swagger: http://localhost:3001/docs
- MySQL: localhost:3306 (schema e seed em [`bd/schema.sql`](bd/schema.sql) aplicados automaticamente na primeira subida)

### Opção 2 — Local (sem Docker para a aplicação, só para o banco)

```bash
cp .env.example .env
docker compose up db          # só o MySQL

cd backend
cp .env.example .env          # ajuste DB_HOST=localhost se necessário
npm install
npm run dev                   # http://localhost:3001

cd ../frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:4173
```

## Variáveis de ambiente

| Arquivo         | Variáveis                                                                             | Uso                                         |
| --------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `.env` (raiz)   | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_PORT` | Container do MySQL (docker-compose)         |
| `backend/.env`  | `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`                     | Conexão do backend com o banco              |
| `frontend/.env` | `VITE_API_BASE_URL`                                                                   | URL base do backend consumida pelo frontend |

Exemplos em `.env.example` / `backend/.env.example` / `frontend/.env.example`.

## Testes

Requer `npm install` prévio em cada pasta (veja "Como rodar" acima).

```bash
cd backend && npm test    # Vitest — regras de precificação (Strategy), conversão cambial, validação
cd frontend && npm test   # Vitest + React Testing Library — validação, paginação, integrações
```

## Funcionalidades

### Backend

- **Motor de câmbio**: `GET /cambio` (lista taxas cadastradas), `POST /cambio` (cadastra/atualiza taxa entre duas moedas).
- **Motor de precificação (Strategy Pattern)**: cada tipo de recebível (Duplicata Mercantil, Cheque Pré-datado) tem sua própria classe de estratégia com spread próprio; a fórmula `Valor Presente = Valor Face / (1 + Taxa Base + Spread)^Prazo` é compartilhada e desacoplada da regra de risco. Conversão cambial aplicada automaticamente quando moeda do título ≠ moeda de pagamento.
- **Persistência ACID**: criação de transação e liquidação rodam dentro de uma transação de banco (`QueryRunner`), com rollback automático em qualquer falha. A liquidação usa lock pessimista (`SELECT ... FOR UPDATE`) para impedir liquidação em duplicidade sob concorrência.
- **Liquidação**: `PATCH /transacoes/:id/liquidar` transiciona uma transação de `PENDENTE` para `LIQUIDADA`, gravando `data_liquidacao`. Rejeita transações já liquidadas/canceladas com 422.
- **Extrato analítico**: `GET /extrato` com filtros (período, cedente, moeda de pagamento, status) e paginação server-side, via Knex puro (sem ORM) para performance em relatórios.
- **Cadastros de apoio**: `GET /moedas`, `GET /cedentes`, `GET /tipos_recebiveis`, `GET /taxa-base`.
- **Validação e erros**: todo input validado com Zod (body/query/params); exceptions de domínio tipadas (`BusinessRuleError` → 422, `NotFoundError` → 404) tratadas por um exception handler global.
- **Documentação**: Swagger/OpenAPI em `/docs`.

### Frontend

- **Painel do Operador** (`/transacao`): formulário com validação field-level (erro por campo + highlight, submit bloqueado até corrigir), preview em tempo real do valor líquido calculado com a taxa base **real** vinda do backend, feedback de sucesso/erro via toast (com o valor líquido efetivamente gravado).
- **Extrato de Liquidação** (`/extrato`): grid com paginação server-side, filtros dinâmicos (incluindo status como `select` restrito ao enum do backend), e ação **Liquidar** por linha para transações `PENDENTE`.
- **Gestão de Câmbio** (`/cambio`): lista as taxas cadastradas e permite cadastrar uma nova taxa entre duas moedas.
- **Arquitetura**: componentes de UI reutilizáveis (`Button`, `Select`, `Spinner`, `ToastProvider`) separados das páginas, que concentram estado e lógica de negócio/integração com a API. Listas de baixa volatilidade (cedentes, tipos de recebível) usam retry com backoff + cache em `sessionStorage`.

## Documentação adicional

- [Diagrama ER](docs/er-diagram.md)
- [Script DDL](bd/schema.sql)
- [AI_USAGE.md](AI_USAGE.md) — uso de IA neste projeto
- [frontend/README.md](frontend/README.md) — detalhes específicos do frontend

## Estrutura do repositório

```
backend/    API REST (controller → service → repository), Strategy Pattern, TypeORM + Knex
frontend/   SPA React (pages → components/services/utils)
bd/         Script DDL + configuração MySQL
docs/       Diagrama ER
```

## Git Workflow

Branches de feature (`feat/*`) integradas em `development`, promovida para `main` via Pull Request. Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`) usados em todo o histórico.
