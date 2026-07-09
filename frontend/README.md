# SRM Credit Engine - Frontend

Frontend (React + Vite + TypeScript) do painel do operador e extrato de liquidação.

## Setup

From the `frontend` folder:

```bash
npm install
cp .env.example .env   # ajuste VITE_API_BASE_URL se necessário
npm run dev
```

Default dev server: `http://localhost:4173`

## Ambiente / API

- O frontend espera o backend rodando em `http://localhost:3001` por padrão.
- Variável de ambiente `VITE_API_BASE_URL`: define a base URL usada pelo cliente Axios (`src/services/api.ts`). Veja `.env.example`.
  - No desenvolvimento, crie um arquivo `.env` dentro de `frontend/` (baseado em `.env.example`) com:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

## Comandos

```bash
npm run dev        # inicia o servidor de desenvolvimento (Vite)
npm run build       # typecheck + build de produção
npm run preview     # serve o build de produção localmente
npm run test        # roda os testes unitários (Vitest) uma vez
npm run test:watch  # roda os testes em modo watch
```

## O que foi implementado

- Pages: `HomePage`, `TransacaoPage`, `ExtratoPage`
- `TransacaoPage`:
  - busca de `moedas`, `tipos_recebiveis` e `cedentes` (com retry + cache em `sessionStorage` para as duas últimas, e fallback para os valores do seed em caso de falha)
  - validação client-side field-level (mensagem inline + highlight por campo, submit bloqueado até corrigir)
  - preview em tempo real do cálculo do valor líquido
  - envio para `POST /transacoes` (cria a transação), com feedback via toast de sucesso/erro
- `ExtratoPage`:
  - busca `GET /extrato` com filtros (período, cedente, moeda de pagamento, status)
  - paginação server-side (página, itens por página, total de resultados)
- Componentes reutilizáveis em `src/components/`: `Button`, `Select`, `Spinner`, `ToastProvider`
- Testes unitários (Vitest + React Testing Library) cobrindo `utils/number.ts`, validação/preview da `TransacaoPage` e paginação da `ExtratoPage`

## Notas

- Se o backend não expor `tipos_recebiveis` ou `cedentes`, o frontend usa valores de fallback baseados no seed fornecido.
- Para garantir acentuação correta no banco, crie o container com o volume limpo (`docker compose down -v && docker compose up`).

## Próximos passos recomendados

- Integrar corretamente as rotas de `tipos_recebiveis` e `cedentes` no backend
- Adicionar tratamento de autenticação se necessário
- Melhorar formatação/locale de moedas
- Adicionar testes E2E (Playwright)
