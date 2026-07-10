# Diagrama ER — SRM Credit Engine

Modelo relacional normalizado (3FN). Script DDL completo com constraints, índices e seed de dados em [`bd/schema.sql`](../bd/schema.sql).

```mermaid
erDiagram
    MOEDAS ||--o{ TRANSACOES : "moeda_titulo"
    MOEDAS ||--o{ TRANSACOES : "moeda_pagamento"
    MOEDAS ||--o{ TAXAS_CAMBIO : "origem"
    MOEDAS ||--o{ TAXAS_CAMBIO : "destino"
    CEDENTES ||--o{ TRANSACOES : "cede"
    TIPOS_RECEBIVEIS ||--o{ TRANSACOES : "tipifica"

    MOEDAS {
        int id PK
        varchar nome
        varchar codigo UK
    }
    CEDENTES {
        int id PK
        varchar nome
        varchar cnpj UK
        varchar email
    }
    TIPOS_RECEBIVEIS {
        int id PK
        varchar nome
        decimal spread "risco/spread do produto (a.m.)"
    }
    TAXAS_BASE {
        int id PK
        varchar nome
        decimal valor
        timestamp data_vigencia
    }
    TAXAS_CAMBIO {
        int id PK
        int moeda_origem_id FK
        int moeda_destino_id FK
        decimal valor_taxa
        timestamp data_taxa
    }
    TRANSACOES {
        int id PK
        int cedente_id FK
        int produto_id FK
        int moeda_titulo_id FK
        int moeda_pagamento_id FK
        decimal valor_face
        decimal valor_liquido "calculado no momento da criação"
        decimal taxa_base_aplicada "snapshot"
        decimal spread_aplicado "snapshot"
        decimal fator_cambio_aplicado "snapshot"
        int prazo_meses
        varchar status "PENDENTE | LIQUIDADA | CANCELADA"
        timestamp data_transacao
        timestamp data_liquidacao
        varchar hash_auditoria "SHA-256 dos dados críticos"
    }
```

## Decisões de modelagem

- **Snapshot de taxas na transação** (`taxa_base_aplicada`, `spread_aplicado`, `fator_cambio_aplicado`): a transação registra as taxas vigentes no momento da criação, não uma referência viva a `tb_taxas_base`/`tb_taxas_cambio`. Isso garante que uma transação liquidada não mude de valor retroativamente se a taxa base ou o câmbio forem atualizados depois — requisito de auditabilidade financeira.
- **`hash_auditoria`**: hash SHA-256 dos dados críticos da transação (cedente, valores, taxas aplicadas, prazo), gerado em `AuditoriaService`. Permite detectar divergência/adulteração dos dados após a persistência.
- **`status` como máquina de estados simples**: `PENDENTE → LIQUIDADA` via `PATCH /transacoes/:id/liquidar`, protegido por lock pessimista (`SELECT ... FOR UPDATE`) dentro de uma transação ACID para evitar liquidação em duplicidade sob concorrência. `CANCELADA` está modelado no schema para evolução futura, mas não há fluxo de cancelamento implementado nesta entrega (fora do escopo Pleno).
- **Índices**: `idx_transacoes_extrato` (composto por `data_transacao`, `moeda_pagamento_id`, `cedente_id`) foi desenhado especificamente para o padrão de consulta do endpoint de Extrato (filtro por período + moeda + cedente).
