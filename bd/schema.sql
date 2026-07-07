-- =====================================================================
-- SRM Credit Engine - DDL
-- =====================================================================

CREATE TABLE tb_moedas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(50) NOT NULL,
    codigo      VARCHAR(3)  NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_moedas_codigo UNIQUE (codigo)
);

CREATE TABLE tb_taxas_cambio (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    moeda_origem_id     INT NOT NULL,
    moeda_destino_id    INT NOT NULL,
    valor_taxa          DECIMAL(18,6) NOT NULL,
    data_taxa           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_taxas_origem  FOREIGN KEY (moeda_origem_id)  REFERENCES tb_moedas(id),
    CONSTRAINT fk_taxas_destino FOREIGN KEY (moeda_destino_id) REFERENCES tb_moedas(id),
    CONSTRAINT ck_taxas_moedas_diferentes CHECK (moeda_origem_id <> moeda_destino_id),
    CONSTRAINT ck_taxas_valor_positivo CHECK (valor_taxa > 0)
);

CREATE INDEX idx_taxas_cambio_busca
    ON tb_taxas_cambio (moeda_origem_id, moeda_destino_id, data_taxa DESC);

CREATE TABLE tb_taxas_base (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(50) NOT NULL,
    valor           DECIMAL(7,4) NOT NULL,
    data_vigencia   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_taxas_base_valor_positivo CHECK (valor >= 0)
);

CREATE INDEX idx_taxas_base_vigencia
    ON tb_taxas_base (data_vigencia DESC);

CREATE TABLE tb_tipos_recebiveis (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(45) NOT NULL,
    spread      DECIMAL(5,4) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT ck_tipos_spread_positivo CHECK (spread >= 0)
);

CREATE TABLE tb_cedentes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    cnpj        VARCHAR(14) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_cedentes_cnpj UNIQUE (cnpj)
);

CREATE TABLE tb_transacoes (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    cedente_id              INT NOT NULL,
    produto_id              INT NOT NULL,
    moeda_titulo_id         INT NOT NULL,
    moeda_pagamento_id      INT NOT NULL,

    valor_face              DECIMAL(15,2) NOT NULL,
    valor_liquido           DECIMAL(15,2),

    -- Snapshots pra congelar os valores da transação no momento de criação
    taxa_base_aplicada      DECIMAL(7,4) NOT NULL,
    spread_aplicado         DECIMAL(5,4) NOT NULL,
    fator_cambio_aplicado   DECIMAL(18,6) NOT NULL DEFAULT 1.0,

    prazo_meses             INT NOT NULL,

    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',

    data_transacao          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_liquidacao         TIMESTAMP NULL,

    hash_auditoria          VARCHAR(64) NOT NULL,

    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Update_at para dizer quando a coluna status e data_liquidacao foram alteradas, sendo as unicas possíveis de alteração 
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_transacoes_cedente         FOREIGN KEY (cedente_id)         REFERENCES tb_cedentes(id),
    CONSTRAINT fk_transacoes_produto         FOREIGN KEY (produto_id)         REFERENCES tb_tipos_recebiveis(id),
    CONSTRAINT fk_transacoes_moeda_titulo    FOREIGN KEY (moeda_titulo_id)    REFERENCES tb_moedas(id),
    CONSTRAINT fk_transacoes_moeda_pagamento FOREIGN KEY (moeda_pagamento_id) REFERENCES tb_moedas(id),

    CONSTRAINT ck_transacoes_status
        CHECK (status IN ('PENDENTE', 'LIQUIDADA', 'CANCELADA')),
    CONSTRAINT ck_transacoes_valor_face_positivo CHECK (valor_face > 0),
    CONSTRAINT ck_transacoes_prazo_positivo CHECK (prazo_meses > 0)
);

CREATE INDEX idx_transacoes_cedente        ON tb_transacoes (cedente_id);
CREATE INDEX idx_transacoes_data           ON tb_transacoes (data_transacao);
CREATE INDEX idx_transacoes_status         ON tb_transacoes (status);
CREATE INDEX idx_transacoes_moeda_pagamento ON tb_transacoes (moeda_pagamento_id);

-- Índice para o extrato de liquidação
CREATE INDEX idx_transacoes_extrato
    ON tb_transacoes (data_transacao, moeda_pagamento_id, cedente_id);